
const API_URL = "http://127.0.0.1:8000/api/students/";

const form = document.getElementById("studentForm");
const idInput = document.getElementById("studentId");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const courseInput = document.getElementById("course");
const ageInput = document.getElementById("age");

const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");
const refreshButton = document.getElementById("refreshButton");
const searchInput = document.getElementById("searchInput");

const studentList = document.getElementById("studentList");
const recordCount = document.getElementById("recordCount");
const tableSummary = document.getElementById("tableSummary");
const message = document.getElementById("message");
const loading = document.getElementById("loading");
const formTitle = document.getElementById("formTitle");

let students = [];
let busy = false;

function showMessage(text, type = "success") {
    message.textContent = text;
    message.className = `message ${type}`;
    message.hidden = !text;
}

async function apiRequest(url, options = {}) {
    let response;

    try {
        response = await fetch(url, {
            ...options,
            headers: {
                Accept: "application/json",
                ...(options.body
                    ? { "Content-Type": "application/json" }
                    : {}),
                ...options.headers
            }
        });
    } catch {
        throw new Error(
            "Cannot connect to Django. Start your backend and check the API URL."
        );
    }

    // Django may return an empty response after DELETE.
    if (response.status === 204) {
        return null;
    }

    const text = await response.text();
    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = null;
        }
    }

    if (!response.ok) {
        if (data?.detail) {
            throw new Error(data.detail);
        }

        const details = data && typeof data === "object"
            ? Object.entries(data)
                .map(([field, value]) =>
                    `${field}: ${Array.isArray(value) ? value.join(", ") : value}`
                )
                .join(" | ")
            : "";

        throw new Error(details || `Request failed (${response.status}).`);
    }

    return data;
}

async function getAllStudents() {
    let url = API_URL;
    const results = [];
    const visited = new Set();

    while (url) {
        if (visited.has(url)) {
            throw new Error("Repeated pagination URL returned by the API.");
        }

        visited.add(url);
        const data = await apiRequest(url);

        if (Array.isArray(data)) {
            results.push(...data);
            url = null;
        } else if (data && Array.isArray(data.results)) {
            results.push(...data.results);
            url = data.next || null;
        } else {
            throw new Error("Unexpected student list response from Django.");
        }
    }

    return results;
}

function showEmptyRow(text) {
    studentList.replaceChildren();

    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 4;
    cell.className = "empty";
    cell.textContent = text;

    row.appendChild(cell);
    studentList.appendChild(row);
}

function renderStudents() {
    const query = searchInput.value.trim().toLowerCase();

    const filtered = students.filter(student =>
        [student.name, student.email, student.course]
            .some(value =>
                String(value ?? "").toLowerCase().includes(query)
            )
    );

    studentList.replaceChildren();

    recordCount.textContent =
        `${filtered.length} record${filtered.length === 1 ? "" : "s"}`;

    tableSummary.textContent =
        `Showing ${filtered.length} of ${students.length} students`;

    if (filtered.length === 0) {
        showEmptyRow(query
            ? "No students match your search."
            : "No student records found."
        );
        return;
    }

    filtered.forEach(student => {
        const row = document.createElement("tr");

        // Student name and email
        const studentCell = document.createElement("td");
        const info = document.createElement("div");
        info.className = "student-info";

        const avatar = document.createElement("span");
        avatar.className = "avatar";
        avatar.textContent =
            String(student.name || "S").trim().charAt(0).toUpperCase();

        const details = document.createElement("div");

        const name = document.createElement("div");
        name.className = "student-name";
        name.textContent = student.name || "";

        const email = document.createElement("div");
        email.className = "student-email";
        email.textContent = student.email || "";

        details.append(name, email);
        info.append(avatar, details);
        studentCell.appendChild(info);

        // Course
        const courseCell = document.createElement("td");
        const courseTag = document.createElement("span");
        courseTag.className = "course-tag";
        courseTag.textContent = student.course || "";
        courseCell.appendChild(courseTag);

        // Age
        const ageCell = document.createElement("td");
        ageCell.textContent = student.age ?? "";

        // Actions
        const actionsCell = document.createElement("td");
        const actions = document.createElement("div");
        actions.className = "actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "btn btn-edit";
        editButton.textContent = "Edit";
        editButton.disabled = busy;
        editButton.addEventListener("click", () => editStudent(student));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-delete";
        deleteButton.textContent = "Delete";
        deleteButton.disabled = busy;
        deleteButton.addEventListener("click", () => deleteStudent(student));

        actions.append(editButton, deleteButton);
        actionsCell.appendChild(actions);

        row.append(studentCell, courseCell, ageCell, actionsCell);
        studentList.appendChild(row);
    });
}

async function loadStudents() {
    if (busy) return;

    loading.hidden = false;
    refreshButton.disabled = true;

    if (students.length === 0) {
        showEmptyRow("Loading student records...");
    }

    try {
        students = await getAllStudents();
        renderStudents();
        showMessage("");
    } catch (error) {
        showMessage(error.message, "error");
        showEmptyRow("Could not load students. Check the backend and refresh.");
        recordCount.textContent = "Unavailable";
        tableSummary.textContent = "Unable to load records";
    } finally {
        loading.hidden = true;
        refreshButton.disabled = false;
    }
}

function editStudent(student) {
    if (busy) return;

    idInput.value = student.id;
    nameInput.value = student.name ?? "";
    emailInput.value = student.email ?? "";
    courseInput.value = student.course ?? "";
    ageInput.value = student.age ?? "";

    formTitle.textContent = "Edit Student";
    saveButton.textContent = "Save Changes";
    cancelButton.hidden = false;

    document.getElementById("student-form").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    nameInput.focus();
}

function resetForm() {
    form.reset();
    idInput.value = "";
    formTitle.textContent = "Add a Student";
    saveButton.textContent = "Add Student";
    cancelButton.hidden = true;
}

form.addEventListener("submit", async event => {
    event.preventDefault();

    if (busy) return;

    const id = idInput.value.trim();
    const age = Number(ageInput.value);

    if (
        !nameInput.value.trim() ||
        !emailInput.value.trim() ||
        !courseInput.value.trim() ||
        !ageInput.value ||
        !Number.isInteger(age) ||
        age < 1 ||
        age > 120
    ) {
        showMessage("Enter a name, valid email, course, and valid age.", "error");
        return;
    }

    // These field names match the backend model and serializer.
    const student = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        course: courseInput.value.trim(),
        age: age
    };

    const url = id
        ? `${API_URL}${encodeURIComponent(id)}/`
        : API_URL;

    busy = true;
    saveButton.disabled = true;
    cancelButton.disabled = true;
    refreshButton.disabled = true;

    try {
        await apiRequest(url, {
            method: id ? "PUT" : "POST",
            body: JSON.stringify(student)
        });

        resetForm();

        try {
            students = await getAllStudents();
            renderStudents();

            showMessage(
                id
                    ? "Student updated successfully."
                    : "Student added successfully."
            );
        } catch (error) {
            showMessage(
                "The save request succeeded, but refreshing records failed: " +
                error.message,
                "error"
            );
        }
    } catch (error) {
        showMessage(error.message, "error");
    } finally {
        busy = false;
        saveButton.disabled = false;
        cancelButton.disabled = false;
        refreshButton.disabled = false;
        renderStudents();
    }
});

async function deleteStudent(student) {
    if (busy) return;

    if (!confirm(`Are you sure you want to delete ${student.name}?`)) {
        return;
    }

    busy = true;
    refreshButton.disabled = true;

    try {
        await apiRequest(
            `${API_URL}${encodeURIComponent(student.id)}/`,
            { method: "DELETE" }
        );

        students = students.filter(
            item => String(item.id) !== String(student.id)
        );

        renderStudents();
        showMessage("Student deleted successfully.");
    } catch (error) {
        showMessage(error.message, "error");
    } finally {
        busy = false;
        refreshButton.disabled = false;
        renderStudents();
    }
}

searchInput.addEventListener("input", renderStudents);
refreshButton.addEventListener("click", loadStudents);

cancelButton.addEventListener("click", () => {
    resetForm();
    showMessage("");
});

loadStudents();







