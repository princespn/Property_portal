
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
        listingType: "",
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
            listingType: "",
            minPrice: "",
            maxPrice: "",
        };

        setFilters(emptyFilters);
        setAppliedFilters(emptyFilters);
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

    return (
        <main>
            {/* Hero Section */}
            <section className="bg-dark text-white py-5">
                <div className="container py-4">
                    <div className="row align-items-center g-4">
                        <div className="col-lg-7">
                            <span className="badge bg-primary mb-3">
                                Find Your Perfect Property
                            </span>

                            <h1 className="display-4 fw-bold mb-3">
                                Discover a Place
                                <br />
                                You'll Love to Call Home
                            </h1>

                            <p className="lead text-light mb-4">
                                Explore properties for sale and rent.
                                Find apartments, houses, plots, and
                                commercial spaces in your preferred city.
                            </p>

                            <div className="d-flex flex-wrap gap-2">
                                <a
                                    href="#properties"
                                    className="btn btn-primary btn-lg"
                                >
                                    Explore Properties
                                </a>

                                <button
                                    type="button"
                                    className="btn btn-outline-light btn-lg"
                                    onClick={onLogin}
                                >
                                    Login
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-light btn-lg"
                                    onClick={onRegister}
                                >
                                    Register
                                </button>
                            </div>
                        </div>

                        <div className="col-lg-5">
                            <div className="bg-secondary bg-opacity-25 rounded-4 p-4 p-md-5">
                                <h3 className="fw-bold mb-3">
                                    Your Next Property Starts Here
                                </h3>

                                <p className="text-light mb-0">
                                    Search by location, property type,
                                    budget, and whether you want to buy
                                    or rent.
                                </p>

                                <div className="row g-3 mt-3">
                                    <div className="col-6">
                                        <div className="bg-dark rounded-3 p-3">
                                            <h4 className="mb-1">
                                                <i className="bi bi-house-door me-2" />
                                                Buy
                                            </h4>
                                            <small className="text-light">
                                                Find your home
                                            </small>
                                        </div>
                                    </div>

                                    <div className="col-6">
                                        <div className="bg-dark rounded-3 p-3">
                                            <h4 className="mb-1">
                                                <i className="bi bi-key me-2" />
                                                Rent
                                            </h4>
                                            <small className="text-light">
                                                Find a rental
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Search Filters */}
            <section className="py-4 bg-light">
                <div className="container">
                    <form
                        className="card border-0 shadow-sm"
                        onSubmit={handleSearch}
                    >
                        <div className="card-body p-3 p-md-4">
                            <h5 className="fw-bold mb-3">
                                <i className="bi bi-search me-2" />
                                Find Your Property
                            </h5>

                            <div className="row g-3">
                                <div className="col-md-6 col-lg-3">
                                    <label
                                        htmlFor="city"
                                        className="form-label"
                                    >
                                        City
                                    </label>

                                    <input
                                        id="city"
                                        type="text"
                                        name="city"
                                        className="form-control"
                                        placeholder="Enter city"
                                        value={filters.city}
                                        onChange={handleFilterChange}
                                    />
                                </div>

                                <div className="col-md-6 col-lg-2">
                                    <label
                                        htmlFor="listingType"
                                        className="form-label"
                                    >
                                        Listing Type
                                    </label>

                                    <select
                                        id="listingType"
                                        name="listingType"
                                        className="form-select"
                                        value={filters.listingType}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">Buy or Rent</option>
                                        <option value="sale">For Sale</option>
                                        <option value="rent">For Rent</option>
                                    </select>
                                </div>

                                <div className="col-md-6 col-lg-2">
                                    <label
                                        htmlFor="propertyType"
                                        className="form-label"
                                    >
                                        Property Type
                                    </label>

                                    <select
                                        id="propertyType"
                                        name="propertyType"
                                        className="form-select"
                                        value={filters.propertyType}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">All Types</option>
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

                                <div className="col-md-6 col-lg-2">
                                    <label
                                        htmlFor="minPrice"
                                        className="form-label"
                                    >
                                        Min Price (₹)
                                    </label>

                                    <input
                                        id="minPrice"
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
                                    <label
                                        htmlFor="maxPrice"
                                        className="form-label"
                                    >
                                        Max Price (₹)
                                    </label>

                                    <input
                                        id="maxPrice"
                                        type="number"
                                        name="maxPrice"
                                        min="0"
                                        className="form-control"
                                        placeholder="Maximum"
                                        value={filters.maxPrice}
                                        onChange={handleFilterChange}
                                    />
                                </div>

                                <div className="col-md-6 col-lg-1 d-flex align-items-end">
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                        title="Search properties"
                                    >
                                        <i className="bi bi-search" />
                                    </button>
                                </div>

                                <div className="col-12 text-end">
                                    <button
                                        type="button"
                                        className="btn btn-link text-decoration-none"
                                        onClick={handleReset}
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </section>

            {/* Property Listings */}
            <section id="properties" className="py-5">
                <div className="container">
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
                        <div>
                            <h2 className="fw-bold mb-1">
                                Featured Properties
                            </h2>

                            <p className="text-muted mb-0">
                                Explore available properties for sale and rent.
                            </p>
                        </div>

                        <span className="badge bg-primary fs-6">
                            {properties.length}{" "}
                            {properties.length === 1
                                ? "Property"
                                : "Properties"}
                        </span>
                    </div>

                    {loading && (
                        <div className="text-center py-5">
                            <div
                                className="spinner-border text-primary"
                                role="status"
                            >
                                <span className="visually-hidden">
                                    Loading...
                                </span>
                            </div>

                            <p className="text-muted mt-3">
                                Loading properties...
                            </p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="alert alert-danger" role="alert">
                            <i className="bi bi-exclamation-triangle me-2" />
                            {error}

                            <button
                                type="button"
                                className="btn btn-sm btn-outline-danger ms-3"
                                onClick={() =>
                                    setAppliedFilters({ ...appliedFilters })
                                }
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        properties.length === 0 && (
                            <div className="text-center py-5">
                                <i className="bi bi-houses display-3 text-muted" />

                                <h4 className="mt-3">
                                    No properties found
                                </h4>

                                <p className="text-muted">
                                    Try another city or clear your filters.
                                </p>

                                <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={handleReset}
                                >
                                    Clear Filters
                                </button>
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
                                        <div className="card h-100 border-0 shadow-sm">
                                            <div
                                                className="position-relative bg-light"
                                                style={{ height: "210px" }}
                                            >
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={property.title}
                                                        className="w-100 h-100"
                                                        style={{
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-secondary">
                                                        <i className="bi bi-house-door display-3" />
                                                        <span>
                                                            Property Image
                                                        </span>
                                                    </div>
                                                )}

                                                <span
                                                    className={`badge position-absolute top-0 start-0 m-3 ${
                                                        property.listingType ===
                                                        "rent"
                                                            ? "bg-success"
                                                            : "bg-primary"
                                                    }`}
                                                >
                                                    {property.listingType ===
                                                    "rent"
                                                        ? "For Rent"
                                                        : "For Sale"}
                                                </span>
                                            </div>

                                            <div className="card-body d-flex flex-column">
                                                <h5 className="card-title fw-bold">
                                                    {property.title}
                                                </h5>

                                                <p className="text-primary fw-bold fs-5 mb-2">
                                                    {formatPrice(
                                                        property.price,
                                                        property.listingType
                                                    )}
                                                </p>

                                                <p className="text-muted small mb-3">
                                                    <i className="bi bi-geo-alt me-1" />
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
                                                        {capitalize(
                                                            property.propertyType
                                                        )}
                                                    </span>

                                                    {property.bedrooms != null && (
                                                        <span className="badge bg-light text-dark border">
                                                            <i className="bi bi-door-closed me-1" />
                                                            {property.bedrooms} Beds
                                                        </span>
                                                    )}

                                                    {property.bathrooms != null && (
                                                        <span className="badge bg-light text-dark border">
                                                            <i className="bi bi-droplet me-1" />
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
                                                        className="btn btn-outline-primary w-100"
                                                    >
                                                        View Details
                                                        <i className="bi bi-arrow-right ms-2" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Call to Action */}
            <section className="bg-light py-5">
                <div className="container text-center py-3">
                    <h2 className="fw-bold mb-3">
                        Have a Property to List?
                    </h2>

                    <p className="text-muted mb-4">
                        Register as an agent or dealer to list and manage
                        your properties.
                    </p>

                    <button
                        type="button"
                        className="btn btn-primary btn-lg"
                        onClick={onRegister}
                    >
                        Get Started
                    </button>
                </div>
            </section>
        </main>
    );
};

export default Home;
