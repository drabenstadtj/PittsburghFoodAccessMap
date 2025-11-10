import React, {useState} from "react";

const Navbar = (props) => {
  const sidebarClass = props.isOpen ? "sidebar open" : "sidebar";

  // state used for tracking what types of food resources to display
  const [filters, setFilters] = useState({
    grocery: false,
    pantry: false,
    farmer: false,
  });

  // handle checkbox toggle
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFilters((prev) => ({ ...prev, [name]: checked }));
    console.log("updated checkbox state")
  };

  // clear all checkboxes
  const handleShowAll = () => {
    setFilters({
      grocery: false,
      pantry: false,
      farmer: false,
    });
  };


  return (
    <div className={sidebarClass}>
      <button onClick={props.toggleSidebar} className="sidebar-toggle">
      Toggle Sidebar
      </button>

      <div id="sidebar-content">
        <div id="sidebar-filters">
          <p>Filters:</p>
          <form>
              <input type="checkbox" id="grocery" name="grocery" checked={filters.grocery} onChange={handleCheckboxChange}></input>
              <label htmlFor="grocery">Grocery Store</label><br></br>
          
              <input type="checkbox" id="pantry" name="pantry" checked={filters.pantry} onChange={handleCheckboxChange}></input>
              <label for="pantry">Food Pantry</label><br></br>

              <input type="checkbox" id="farmer" name="farmer" checked={filters.farmer} onChange={handleCheckboxChange}></input>
              <label for="farmer">Farmer's Market</label><br></br>
          </form>
          <button onClick={handleShowAll}>Show all</button>
        </div>

        <div id="sidebar-external-links">
          <button>Admin Dashboard</button>
          <button>Report</button>
        </div>
      </div>
    </div>
  );
};
export default Navbar;