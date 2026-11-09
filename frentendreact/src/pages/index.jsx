import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const Home = ({ onLogin, onRegister }) => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [filters, setFilters] = useState({
        city: "",
        propertyType: "",
        listingType: "sale",
        minPrice: "",
        maxPrice: "",
    });

    const [appliedFilters, setAppliedFilters] = useState({ ...filters });

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setLoading(true);
                setError("");

                const params = Object.fromEntries(
                    Object.entries(appliedFilters).filter(
                        ([, value]) => value !== ""
                    )
                );

                const response = await api.get("/properties", {
                    params: {
                        ...params,
                        page: 1,
                        limit: 12,
                    },
                });

                const result = response.data;

                setProperties(
                    Array.isArray(result.properties)
                        ? result.properties
                        : Array.isArray(result.data)
                          ? result.data
                          : Array.isArray(result)
                            ? result
                            : []
                );
            } catch (err) {
                console.error("Failed to fetch properties:", err);
                setError(
                    err.response?.data?.error ||
                    "Unable to load properties. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, [appliedFilters]);

    const handleFilterChange = (event) => {
        const { name, value } = event.target;

        setFilters((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSearch = (event) => {
        event.preventDefault();
        setAppliedFilters({ ...filters });
    };

    const handleReset = () => {
        const emptyFilters = {
            city: "",
            propertyType: "",
            listingType: "sale",
            minPrice: "",
            maxPrice: "",
        };

        setFilters(emptyFilters);
        setAppliedFilters(emptyFilters);
    };

    const selectListingType = (type) => {
        const updated = {
            ...filters,
            listingType: type,
        };

        setFilters(updated);
        setAppliedFilters(updated);
    };

    const selectPropertyType = (type) => {
        const updated = {
            ...filters,
            propertyType: type,
        };

        setFilters(updated);
        setAppliedFilters(updated);
        document.getElementById("property-search")?.scrollIntoView({
            behavior: "smooth",
        });
    };

    const formatPrice = (price, listingType) => {
        const amount = Number(price);

        if (!Number.isFinite(amount)) {
            return "Price on request";
        }

        const formatted = new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);

        return listingType === "rent"
            ? `${formatted} / month`
            : formatted;
    };

    const getPropertyImage = (property) => {
        const firstImage = Array.isArray(property.images)
            ? property.images[0]
            : null;

        if (typeof firstImage === "string") {
            return firstImage;
        }

        return (
            firstImage?.url ||
            firstImage?.imageUrl ||
            property.imageUrl ||
            property.image_url ||
            property.coverImage ||
            ""
        );
    };

    const capitalize = (value = "") =>
        value.charAt(0).toUpperCase() + value.slice(1);

    const categories = [
        {
            title: "Apartments",
            type: "apartment",
            icon: "bi-building",
        },
        {
            title: "Independent Houses",
            type: "house",
            icon: "bi-house-door",
        },
        {
            title: "Plots / Land",
            type: "plot",
            icon: "bi-map",
        },
        {
            title: "Commercial",
            type: "commercial",
            icon: "bi-shop",
        },
    ];

    return (     

        <main className="bg-light">
            <section className="text-white py-5" style={{ backgroundColor: "#1B2A4A" }}>
                <div className="container py-lg-5 py-4">
                    <div className="row align-items-center">
                        <div className="col-lg-9">
                            <span className="badge bg-danger rounded-pill px-3 py-2 mb-3">
                                Find Your Dream Property
                            </span>

                            <h1 className="display-4 fw-bold mb-3">
                                Find the home you will love to come back to
                            </h1>

                            <p className="lead text-white-50 mb-0">
                                Search homes, flats, plots and offices to buy
                                or rent across India's top cities.
                            </p>
                        </div>

                        <div className="col-lg-3 d-none d-lg-block text-center">
                            <i className="bi bi-buildings display-1 text-white-50"></i>
                        </div>
                    </div>
                </div>
            </section>

            {/* Search Section */}
            <section
                id="property-search"
                className="container"
                style={{ marginTop: "-55px", position: "relative" }}
            >
                <form
                    className="card border-0 shadow-lg rounded-4"
                    onSubmit={handleSearch}
                >
                    <div className="card-body p-3 p-lg-4">
                        {/* Buy / Rent tabs */}
                        <div className="d-flex flex-wrap gap-2 mb-4">
                            <button
                                type="button"
                                className={`btn px-4 fw-semibold ${
                                    filters.listingType === "sale"
                                        ? "btn-dark"
                                        : "btn-light"
                                }`}
                                onClick={() => selectListingType("sale")}
                            >
                                <i className="bi bi-house me-2"></i>
                                Buy
                            </button>

                            <button
                                type="button"
                                className={`btn px-4 fw-semibold ${
                                    filters.listingType === "rent"
                                        ? "btn-dark"
                                        : "btn-light"
                                }`}
                                onClick={() => selectListingType("rent")}
                            >
                                <i className="bi bi-key me-2"></i>
                                Rent
                            </button>
                        </div>

                        <div className="row g-3 align-items-end">
                            <div className="col-md-6 col-lg-3">
                                <label className="form-label small fw-bold text-secondary">
                                    CITY
                                </label>

                                <div className="input-group">
                                    <span className="input-group-text bg-white">
                                        <i className="bi bi-geo-alt text-danger"></i>
                                    </span>

                                    <input
                                        type="text"
                                        name="city"
                                        className="form-control"
                                        placeholder="Enter city"
                                        value={filters.city}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div>

                            <div className="col-md-6 col-lg-3">
                                <label className="form-label small fw-bold text-secondary">
                                    PROPERTY TYPE
                                </label>

                                <select
                                    name="propertyType"
                                    className="form-select"
                                    value={filters.propertyType}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Types</option>
                                    <option value="apartment">Apartment</option>
                                    <option value="house">Independent House</option>
                                    <option value="plot">Plot / Land</option>
                                    <option value="commercial">Commercial</option>
                                </select>
                            </div>

                            <div className="col-md-6 col-lg-2">
                                <label className="form-label small fw-bold text-secondary">
                                    MIN PRICE (₹)
                                </label>

                                <input
                                    type="number"
                                    name="minPrice"
                                    min="0"
                                    className="form-control"
                                    placeholder="Minimum"
                                    value={filters.minPrice}
                                    onChange={handleFilterChange}
                                />
                            </div>

                            <div className="col-md-6 col-lg-2">
                                <label className="form-label small fw-bold text-secondary">
                                    MAX PRICE (₹)
                                </label>

                                <input
                                    type="number"
                                    name="maxPrice"
                                    min="0"
                                    className="form-control"
                                    placeholder="Maximum"
                                    value={filters.maxPrice}
                                    onChange={handleFilterChange}
                                />
                            </div>

                            <div className="col-md-6 col-lg-2">
                                <button
                                    type="submit"
                                    className="btn btn-danger w-100 fw-bold py-2"
                                >
                                    <i className="bi bi-search me-2"></i>
                                    Search
                                </button>
                            </div>

                            <div className="col-12 text-end">
                                <button
                                    type="button"
                                    className="btn btn-link text-secondary text-decoration-none btn-sm"
                                    onClick={handleReset}
                                >
                                    <i className="bi bi-arrow-counterclockwise me-1"></i>
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </section>

            {/* Property Categories */}
            <section className="container py-5">
                <div className="row g-3">
                    {categories.map((category) => (
                        <div
                            className="col-6 col-md-3"
                            key={category.type}
                        >
                            <button
                                type="button"
                                className="card border-0 shadow-sm rounded-3 h-100 w-100 text-center text-dark p-3"
                                onClick={() =>
                                    selectPropertyType(category.type)
                                }
                            >
                                <div className="card-body">
                                    <i
                                        className={`bi ${category.icon} fs-1 text-danger`}
                                    ></i>

                                    <h6 className="fw-bold mt-3 mb-0">
                                        {category.title}
                                    </h6>
                                </div>
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Properties */}
            <section id="properties" className="container pb-5">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">
                            Featured Properties
                        </h2>

                        <p className="text-secondary mb-0">
                            Explore properties available for sale and rent.
                        </p>
                    </div>

                    <span className="badge bg-danger fs-6">
                        {properties.length} Properties
                    </span>
                </div>

                {loading && (
                    <div className="text-center py-5">
                        <div
                            className="spinner-border text-danger"
                            role="status"
                        >
                            <span className="visually-hidden">
                                Loading...
                            </span>
                        </div>

                        <p className="text-secondary mt-3">
                            Loading properties...
                        </p>
                    </div>
                )}

                {!loading && error && (
                    <div className="alert alert-danger">
                        <i className="bi bi-exclamation-circle me-2"></i>
                        {error}

                        <button
                            className="btn btn-sm btn-outline-danger ms-3"
                            onClick={() =>
                                setAppliedFilters({ ...appliedFilters })
                            }
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && properties.length === 0 && (
                    <div className="card border-0 shadow-sm text-center py-5">
                        <div className="card-body">
                            <i className="bi bi-houses display-2 text-secondary"></i>

                            <h4 className="fw-bold mt-3">
                                No properties found
                            </h4>

                            <p className="text-secondary">
                                Try another city or change your filters.
                            </p>

                            <button
                                className="btn btn-outline-danger"
                                onClick={handleReset}
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                )}

                {!loading && !error && properties.length > 0 && (
                    <div className="row g-4">
                        {properties.map((property) => {
                            const image = getPropertyImage(property);

                            return (
                                <div
                                    className="col-sm-6 col-lg-4 col-xl-3"
                                    key={property.id}
                                >
                                    <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
                                        <div className="ratio ratio-16x9 bg-secondary-subtle">
                                            {image ? (
                                                <img
                                                    src={image}
                                                    alt={property.title || "Property"}
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            ) : (
                                                <div className="d-flex flex-column align-items-center justify-content-center text-secondary">
                                                    <i className="bi bi-house-door display-3"></i>
                                                    <small>Property Image</small>
                                                </div>
                                            )}

                                            <span
                                                className={`badge position-absolute top-0 start-0 m-3 ${
                                                    property.listingType === "rent"
                                                        ? "bg-success"
                                                        : "bg-danger"
                                                }`}
                                            >
                                                {property.listingType === "rent"
                                                    ? "For Rent"
                                                    : "For Sale"}
                                            </span>
                                        </div>

                                        <div className="card-body d-flex flex-column p-3">
                                            <h5 className="fw-bold mb-2">
                                                {property.title}
                                            </h5>

                                            <h5 className="fw-bold text-danger mb-2">
                                                {formatPrice(
                                                    property.price,
                                                    property.listingType
                                                )}
                                            </h5>

                                            <p className="text-secondary small mb-3">
                                                <i className="bi bi-geo-alt text-danger me-1"></i>

                                                {[
                                                    property.city,
                                                    property.state,
                                                ]
                                                    .filter(Boolean)
                                                    .join(", ") ||
                                                    property.address ||
                                                    "Location not available"}
                                            </p>

                                            <div className="d-flex flex-wrap gap-2 mb-3">
                                                <span className="badge bg-light text-dark border">
                                                    {capitalize(property.propertyType)}
                                                </span>

                                                {property.bedrooms != null && (
                                                    <span className="badge bg-light text-dark border">
                                                        <i className="bi bi-door-closed me-1"></i>
                                                        {property.bedrooms} Beds
                                                    </span>
                                                )}

                                                {property.bathrooms != null && (
                                                    <span className="badge bg-light text-dark border">
                                                        <i className="bi bi-droplet me-1"></i>
                                                        {property.bathrooms} Baths
                                                    </span>
                                                )}

                                                {property.areaSqft != null && (
                                                    <span className="badge bg-light text-dark border">
                                                        {property.areaSqft} sq.ft.
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-auto">
                                                <Link
                                                    to={`/properties/${property.id}`}
                                                    className="btn btn-outline-danger w-100 fw-semibold"
                                                >
                                                    View Details
                                                    <i className="bi bi-arrow-right ms-2"></i>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Call to Action */}
            <section
                className="text-white py-5"
                style={{ backgroundColor: "#1B2A4A" }}
            >
                <div className="container text-center py-4">
                    <i className="bi bi-house-add display-3 text-white-50"></i>

                    <h2 className="fw-bold mt-3">
                        Have a Property to Sell or Rent?
                    </h2>

                    <p className="text-white-50 mb-4">
                        Join our platform as an agent or dealer and list
                        your property for free.
                    </p>

                    <button
                        type="button"
                        className="btn btn-danger btn-lg px-4 fw-semibold"
                        onClick={onRegister}
                    >
                        Post Your Property
                        <i className="bi bi-arrow-right ms-2"></i>
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-top py-4">
                <div className="container">
                    <div className="row align-items-center g-3">
                        <div className="col-md-6">
                            <h5 className="fw-bold mb-1">
                                <i className="bi bi-house-heart-fill text-danger me-2"></i>
                                Nestly
                            </h5>

                            <small className="text-secondary">
                                Find a place you'll love to call home.
                            </small>
                        </div>

                        <div className="col-md-6 text-md-end">
                            <small className="text-secondary">
                                © {new Date().getFullYear()} Nestly. All rights reserved.
                            </small>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
};

export default Home;
