
import { useState, useEffect } from "react";
import api from "../../services/api";

const AMENITIES_LIST = [
    "Parking",
    "Swimming Pool",
    "Gym",
    "Security",
    "Power Backup",
    "Garden",
    "Lift",
    "Furnished",
];

const INITIAL_FORM = {
    title: "",
    description: "",
    propertyType: "apartment",
    listingType: "sale",
    price: "",
    areaSqft: "",
    bedrooms: "",
    bathrooms: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    amenities: [],
};

const getUsersFromResponse = (response) => {
    const body = response?.data;

    if (Array.isArray(body)) return body;
    if (Array.isArray(body?.users)) return body.users;
    if (Array.isArray(body?.data)) return body.data;

    return [];
};

export default function AdminCreatePropertyModal({
    show,
    onClose,
    onPropertyCreated,
}) {
    const [owners, setOwners] = useState([]);
    const [ownerId, setOwnerId] = useState("");
    const [form, setForm] = useState(INITIAL_FORM);

    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const [loadingOwners, setLoadingOwners] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Load both agents and dealers for admin assignment.
    useEffect(() => {
        if (!show) return;

        let cancelled = false;

        const fetchOwners = async () => {
            setLoadingOwners(true);
            setError("");

            try {
                const [agentResponse, dealerResponse] =
                    await Promise.all([
                        api.get("/users?role=agent"),
                        api.get("/users?role=dealer"),
                    ]);

                if (cancelled) return;

                const agents = getUsersFromResponse(agentResponse)
                    .filter((user) => user.role === "agent")
                    .map((user) => ({
                        ...user,
                        role: "agent",
                    }));

                const dealers = getUsersFromResponse(dealerResponse)
                    .filter((user) => user.role === "dealer")
                    .map((user) => ({
                        ...user,
                        role: "dealer",
                    }));

                // Avoid duplicate users if the API returns unexpected data.
                const uniqueOwners = [
                    ...new Map(
                        [...agents, ...dealers].map((user) => [
                            String(user.id),
                            user,
                        ])
                    ).values(),
                ];

                setOwners(uniqueOwners);
            } catch (err) {
                if (!cancelled) {
                    console.error("Failed to fetch agents/dealers:", err);

                    setError(
                        err.response?.data?.message ||
                        "Unable to load agents and dealers."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingOwners(false);
                }
            }
        };

        fetchOwners();

        return () => {
            cancelled = true;
        };
    }, [show]);

    // Release preview URLs when the component unmounts.
    useEffect(() => {
        return () => {
            imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [imagePreviews]);

    if (!show) return null;

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAmenityToggle = (amenity) => {
        setForm((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter((item) => item !== amenity)
                : [...prev.amenities, amenity],
        }));
    };

    const handleImageChange = (event) => {
        const selectedFiles = Array.from(event.target.files || []);
        event.target.value = "";

        const remainingSlots = 5 - images.length;

        if (selectedFiles.length > remainingSlots) {
            setError(
                `You can upload a maximum of 5 images. ` +
                `You can add ${remainingSlots} more.`
            );
            return;
        }

        const validFiles = selectedFiles.filter((file) => {
            if (!file.type.startsWith("image/")) {
                setError("Please select image files only.");
                return false;
            }

            return true;
        });

        if (!validFiles.length) return;

        setError("");

        setImages((prev) => [...prev, ...validFiles]);

        setImagePreviews((prev) => [
            ...prev,
            ...validFiles.map((file) => URL.createObjectURL(file)),
        ]);
    };

    const handleRemoveImage = (index) => {
        URL.revokeObjectURL(imagePreviews[index]);

        setImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        imagePreviews.forEach((url) => URL.revokeObjectURL(url));

        setForm({ ...INITIAL_FORM, amenities: [] });
        setOwnerId("");
        setImages([]);
        setImagePreviews([]);
        setError("");
    };

    const handleClose = () => {
        if (loading) return;

        resetForm();
        onClose();
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!ownerId) {
            setError("Please select an agent or dealer.");
            return;
        }

        const selectedOwner = owners.find(
            (owner) => String(owner.id) === String(ownerId)
        );

        if (
            !selectedOwner ||
            !["agent", "dealer"].includes(selectedOwner.role)
        ) {
            setError("Please select a valid agent or dealer.");
            return;
        }

        if (!form.title.trim() || !form.address.trim() ||
            !form.city.trim() || !form.state.trim()) {
            setError(
                "Please fill in the property title, address, city, and state."
            );
            return;
        }

        if (
            form.price === "" ||
            !Number.isFinite(Number(form.price)) ||
            Number(form.price) < 0
        ) {
            setError("Please enter a valid property price.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const formData = new FormData();

            // Add the selected owner's ID using the key expected by
            // adminCreateProperty in the backend controller.
            const ownerField =
                selectedOwner.role === "agent" ? "agentId" : "dealerId";

            formData.append(ownerField, String(selectedOwner.id));

            // Include only supported property fields.
            Object.entries(form).forEach(([key, value]) => {
                if (key === "amenities") {
                    formData.append(key, JSON.stringify(value));
                    return;
                }

                // Avoid sending empty optional numeric fields.
                if (
                    ["areaSqft", "bedrooms", "bathrooms"].includes(key) &&
                    value === ""
                ) {
                    return;
                }

                if (value !== null && value !== undefined) {
                    formData.append(
                        key,
                        typeof value === "string" ? value.trim() : value
                    );
                }
            });

            images.forEach((image) => {
                formData.append("images", image);
            });

            // The backend assigns pending_approval automatically.
            const response = await api.post(
                "/properties/admin",
                formData
            );

            if (response.data?.success === false) {
                throw new Error(
                    response.data.message || "Failed to create property."
                );
            }

            if (onPropertyCreated) {
                onPropertyCreated(response.data.property);
            }

            resetForm();
            onClose();
        } catch (err) {
            console.error("Admin create property error:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to create property."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 1055,
            }}
        >
            <div className="modal-dialog modal-lg modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <div>
                            <h5 className="modal-title fw-bold">
                                Create Property
                            </h5>
                            <small className="text-muted">
                                Admin: Assign a property to an agent or dealer.
                            </small>
                        </div>

                        <button
                            type="button"
                            className="btn-close"
                            onClick={handleClose}
                            disabled={loading}
                            aria-label="Close"
                        />
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {error && (
                                <div className="alert alert-danger">
                                    {error}
                                </div>
                            )}

                            {/* Owner assignment */}
                            <div className="mb-3">
                                <label className="form-label">
                                    Assign to Agent / Dealer *
                                </label>

                                <select
                                    className="form-select"
                                    value={ownerId}
                                    onChange={(event) =>
                                        setOwnerId(event.target.value)
                                    }
                                    required
                                    disabled={loadingOwners || loading}
                                >
                                    <option value="">
                                        {loadingOwners
                                            ? "Loading agents and dealers..."
                                            : "Select agent or dealer"}
                                    </option>

                                    {owners.map((owner) => (
                                        <option
                                            key={owner.id}
                                            value={owner.id}
                                        >
                                            {owner.name} ({owner.role})
                                            {owner.email
                                                ? ` - ${owner.email}`
                                                : ""}
                                        </option>
                                    ))}
                                </select>

                                {!loadingOwners && owners.length === 0 && (
                                    <small className="text-danger">
                                        No agents or dealers were found.
                                        Check the users API and role filters.
                                    </small>
                                )}
                            </div>

                            <div className="alert alert-info py-2">
                                New properties are submitted as{" "}
                                <strong>Pending Approval</strong>.
                                An administrator must approve them before
                                they appear in public listings.
                            </div>

                            {/* Title and listing type */}
                            <div className="row g-3">
                                <div className="col-md-8">
                                    <label className="form-label">
                                        Property Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        className="form-control"
                                        value={form.title}
                                        onChange={handleChange}
                                        maxLength={255}
                                        required
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        Listing Type *
                                    </label>
                                    <select
                                        name="listingType"
                                        className="form-select"
                                        value={form.listingType}
                                        onChange={handleChange}
                                    >
                                        <option value="sale">For Sale</option>
                                        <option value="rent">For Rent</option>
                                    </select>
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        Property Type *
                                    </label>
                                    <select
                                        name="propertyType"
                                        className="form-select"
                                        value={form.propertyType}
                                        onChange={handleChange}
                                    >
                                        <option value="apartment">
                                            Apartment
                                        </option>
                                        <option value="house">House</option>
                                        <option value="plot">Plot</option>
                                        <option value="commercial">
                                            Commercial
                                        </option>
                                    </select>
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        Price *
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        className="form-control"
                                        min="0"
                                        step="0.01"
                                        value={form.price}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        Area (sqft)
                                    </label>
                                    <input
                                        type="number"
                                        name="areaSqft"
                                        className="form-control"
                                        min="0"
                                        step="any"
                                        value={form.areaSqft}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Bedrooms
                                    </label>
                                    <input
                                        type="number"
                                        name="bedrooms"
                                        className="form-control"
                                        min="0"
                                        step="1"
                                        value={form.bedrooms}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Bathrooms
                                    </label>
                                    <input
                                        type="number"
                                        name="bathrooms"
                                        className="form-control"
                                        min="0"
                                        step="1"
                                        value={form.bathrooms}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label">
                                        Street Address *
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        className="form-control"
                                        value={form.address}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        className="form-control"
                                        value={form.city}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        State *
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        className="form-control"
                                        value={form.state}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label">
                                        Pincode
                                    </label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        className="form-control"
                                        value={form.pincode}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        className="form-control"
                                        rows="3"
                                        value={form.description}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Amenities */}
                                <div className="col-12">
                                    <label className="form-label fw-bold">
                                        Amenities
                                    </label>

                                    <div className="row">
                                        {AMENITIES_LIST.map((amenity) => (
                                            <div
                                                key={amenity}
                                                className="col-md-3 col-6 mb-2"
                                            >
                                                <div className="form-check">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        id={`amenity-${amenity.replace(
                                                            /\s+/g,
                                                            "-"
                                                        )}`}
                                                        checked={form.amenities.includes(
                                                            amenity
                                                        )}
                                                        onChange={() =>
                                                            handleAmenityToggle(
                                                                amenity
                                                            )
                                                        }
                                                    />

                                                    <label
                                                        className="form-check-label small"
                                                        htmlFor={`amenity-${amenity.replace(
                                                            /\s+/g,
                                                            "-"
                                                        )}`}
                                                    >
                                                        {amenity}
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Images */}
                                <div className="col-12">
                                    <label className="form-label">
                                        Property Images (Maximum 5)
                                    </label>

                                    <input
                                        type="file"
                                        className="form-control"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        disabled={images.length >= 5}
                                    />

                                    <small className="text-muted">
                                        {images.length} of 5 images selected.
                                    </small>

                                    {imagePreviews.length > 0 && (
                                        <div className="d-flex gap-2 mt-3 flex-wrap">
                                            {imagePreviews.map((src, index) => (
                                                <div
                                                    key={`${src}-${index}`}
                                                    className="position-relative border rounded p-1"
                                                    style={{
                                                        width: 90,
                                                        height: 90,
                                                    }}
                                                >
                                                    <img
                                                        src={src}
                                                        alt={`Property ${index + 1}`}
                                                        className="w-100 h-100 rounded"
                                                        style={{
                                                            objectFit: "cover",
                                                        }}
                                                    />

                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm position-absolute top-0 end-0"
                                                        style={{
                                                            padding: "0 5px",
                                                        }}
                                                        onClick={() =>
                                                            handleRemoveImage(
                                                                index
                                                            )
                                                        }
                                                        aria-label={`Remove image ${index + 1}`}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={
                                    loading ||
                                    loadingOwners ||
                                    owners.length === 0
                                }
                            >
                                {loading
                                    ? "Creating..."
                                    : "Create Property"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
