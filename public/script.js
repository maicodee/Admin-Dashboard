let data = [];
let currentPage = 1;
const rowsPerPage = 10;
let selectedRows = [];
let filteredData = [];
let totalPages = 1;

// Fetch data when the page loads
fetchData();

async function fetchData() {
  try {
    const response = await fetch(
      "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
    );
    data = await response.json();
    populateTable();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function populateTable() {
  const tableBody = document.getElementById("tableBody");
  tableBody.innerHTML = "";

  const dataToDisplay = filteredData.length ? filteredData : data;

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = dataToDisplay.slice(start, end);

  paginatedData.forEach((entry, index) => {
    const row = document.createElement("tr");
    row.id = `row-${index + start}`;
    row.innerHTML = `
            <td><input type="checkbox" onclick="toggleRowSelection(${
              index + start
            })" ${selectedRows.includes(index + start) ? "checked" : ""}></td>
            <td>${entry.name}</td>
            <td>${entry.email}</td>
            <td>${entry.role}</td>
            <td>
                <button class="edit-action" onclick="editRow(${index})">&#9998;</button>
                <button class="delete-action" onclick="deleteRow(${index})">&#128465;</button>
            </td>
        `;

    // Highlight selected rows
    if (selectedRows.includes(index + start)) {
      row.classList.add("selected");
    }

    tableBody.appendChild(row);
  });

  totalPages = Math.ceil(dataToDisplay.length / rowsPerPage);
  updatePagination();
}

function updatePagination() {
  const paginationContainer = document.getElementById("pagination");
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  paginationContainer.innerHTML = "";

  const createPaginationButton = (label, onClick) => {
    const button = document.createElement("button");
    button.textContent = label;
    button.classList.add("pagination-button");
    button.addEventListener("click", onClick);
    return button;
  };

  const firstPageButton = createPaginationButton("<<", () => goToPage(1));
  paginationContainer.appendChild(firstPageButton);

  const prevPageButton = createPaginationButton("<", () =>
    goToPage(currentPage - 1)
  );
  paginationContainer.appendChild(prevPageButton);

  for (let i = 1; i <= totalPages; i++) {
    const button = createPaginationButton(i, () => goToPage(i));
    if (i === currentPage) {
      button.classList.add("active");
    }
    paginationContainer.appendChild(button);
  }

  const nextPageButton = createPaginationButton(">", () =>
    goToPage(currentPage + 1)
  );
  paginationContainer.appendChild(nextPageButton);

  const lastPageButton = createPaginationButton(">>", () =>
    goToPage(totalPages)
  );
  paginationContainer.appendChild(lastPageButton);
}

function createPaginationButton(label, isActive) {
  const button = document.createElement("button");
  button.textContent = label;
  button.classList.add("pagination-button");
  if (isActive) {
    button.classList.add("active");
  }
  return button;
}

function goToPage(page) {
  currentPage = page;
  populateTable(filteredData);
  updatePagination();
}

async function searchTable() {
  const searchInput = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();

  try {
    const response = await fetch(
      "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json");
    const searchData = await response.json();
    filteredData = searchData.filter((entry) =>
      Object.entries(entry).some(([key, value]) => {
        if (
          ["id", "name", "email", "role"].includes(key) &&
          typeof value === "string"
        ) {
          // Allow partial match for email addresses
          if (
            key === "email" &&
            value.toLowerCase().includes("@") &&
            searchInput.includes("@")
          ) {
            return value.toLowerCase().includes(searchInput);
          }
          return value.toLowerCase().includes(searchInput);
        }
        return false;
      })
    );

    currentPage = 1;
    populateTable();
  } catch (error) {
    console.error("Error fetching and searching data:", error);
  }
}

function toggleRowSelection(index) {
  // Function code remains unchanged
}

function toggleSelectAll() {
  const selectAllCheckbox = document.getElementById("selectAll");
  const checkboxes = document.querySelectorAll(
    '#tableBody input[type="checkbox"]'
  );

  if (selectAllCheckbox.checked) {
    // If "Select All" is checked, select all rows on the current page
    checkboxes.forEach((checkbox, index) => {
      if (index < rowsPerPage) {
        checkbox.checked = true;
        selectedRows.push(index + (currentPage - 1) * rowsPerPage);
      } else {
        checkbox.checked = false;
      }
    });
  } else {
    // If "Select All" is not checked, deselect all rows
    checkboxes.forEach((checkbox, index) => {
      checkbox.checked = false;
      selectedRows = [];
    });
  }
}

function deleteSelectedRows() {
  const tableBody = document.getElementById("tableBody");
  const checkboxes = document.querySelectorAll(
    '#tableBody input[type="checkbox"]:checked'
  );

  checkboxes.forEach((checkbox) => {
    const rowIndex = checkbox.parentNode.parentNode.rowIndex - 1; // Adjust for header row
    tableBody.deleteRow(rowIndex);

    // Remove the deleted row from the selectedRows array
    const indexToRemove = selectedRows.indexOf(rowIndex);
    if (indexToRemove !== -1) {
      selectedRows.splice(indexToRemove, 1);
    }
  });

  // Uncheck the "Select All" checkbox after deletion
  const selectAllCheckbox = document.getElementById("selectAll");
  selectAllCheckbox.checked = false;
}

function createPaginationButton(label, page) {
  // Function code remains unchanged
}

function editRow(index) {
  const rowElement = document.getElementById(`row-${index}`);
  const cells = rowElement.getElementsByTagName("td");

  // Make the Name, Email, and Role cells editable
  for (let i = 1; i <= 3; i++) {
    const cell = cells[i];
    const cellContent = cell.innerText;
    cell.innerHTML = `<input type="text" class="editable" value="${cellContent}">`;
  }

  // Change the Edit button to a Save button
  const editButton = cells[4].querySelector(".edit-action");
  editButton.innerText = "Save";
  editButton.className = "save-action";
  editButton.setAttribute("onclick", `saveRow(${index})`);
}

function saveRow(index) {
  const rowElement = document.getElementById(`row-${index}`);
  const cells = rowElement.getElementsByTagName("td");

  // Get the edited values from the input fields
  const editedName = cells[1].querySelector("input").value;
  const editedEmail = cells[2].querySelector("input").value;
  const editedRole = cells[3].querySelector("input").value;

  // Update the row with the edited values
  cells[1].innerHTML = editedName;
  cells[2].innerHTML = editedEmail;
  cells[3].innerHTML = editedRole;

  // Change the Save button back to an Edit button
  const saveButton = cells[4].querySelector(".save-action");
  saveButton.innerText = "Edit";
  saveButton.className = "edit-action";
  saveButton.setAttribute("onclick", `editRow(${index})`);
}

function deleteRow(index) {
  // Remove the row from the table
  const rowElement = document.getElementById(`row-${index}`);
  rowElement.remove();
}
