const cl = console.log;

const postForm = document.getElementById("postForm");
const body = document.getElementById("body");
const title = document.getElementById("title");
const userId = document.getElementById("userId");

const addBtn = document.getElementById("addBtn");
const updateBtn = document.getElementById("updateBtn");

const postContainer = document.getElementById("postContainer");

// let baseUrl = "http://localhost:3000/blogs";
const baseUrl = "https://node-backdend.onrender.com/blogs";
let postArr = [];

function snackbar(msg, icon) {
  Swal.fire({
    title: msg,
    icon: icon,
    timer: 2000,
  });
}

function creatCard(arr) {
  let result = "";
  arr.forEach((ele) => {
    result += `
      <div class= "col-md-3 mt-4" id="${ele.id}">
      <div class="card">
        <div class="card-header" data-toggle="tooltip" data-placement="top" title="${ele.title}">${ele.title}</div>
        <div class="card-body">
          <p>${ele.body}</p>
          <h6>${ele.userId}</h6>
        </div>
        <div class="card-footer d-flex justify-content-between">
        <button class="btn border-warning" onclick="onEdit(this)"><i class="fa-solid text-warning fa-pen-to-square"></i></button>
        <button class="btn border-danger" onclick="onDelete(this)"><i class="fa-solid text-danger fa-trash"></i></button>
      </div>
      </div>
    </div>`;
  });

  postContainer.innerHTML = result;
}

const spinner = document.getElementById("spinner");

function fetchPost() {
  spinner.classList.remove("d-none");

  fetch(baseUrl, {
    method: "GET",
    // headers: {
    //   "content-type": "application/type",
    // },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("failed to load");
      }
      return res.json();
    })

    .then((data) => {
      creatCard(data.data);

      $(function () {
        $('[data-toggle="tooltip"]').tooltip();
      });
    })
    .catch((err) => {
      snackbar(err, "error");
    })
    .finally(() => {
      spinner.classList.add("d-none");
    });
}

fetchPost();

function onEdit(ele) {
  spinner.classList.remove("d-none");

  let editId = ele.closest(".col-md-3").id;
  localStorage.setItem("editId", editId);
  let editUrl = `${baseUrl}/${editId}`;

  fetch(editUrl, {
    method: "GET",
    body: null,
    headers: {
      "content-type": "application/json",
    },
  })
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      const blog = res.data;

      title.value = blog.title;
      body.value = blog.body;
      userId.value = blog.userId;

      addBtn.classList.add("d-none");
      updateBtn.classList.remove("d-none");

      postForm.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    })
    .catch((err) => {
      snackbar(err, "error");
    })
    .finally(() => {
      spinner.classList.add("d-none");
    });
}

function onSubmit(eve) {
  eve.preventDefault();
  spinner.classList.remove("d-none");

  let newObj = {
    title: title.value,
    body: body.value,
    userId: userId.value,
  };

  fetch(baseUrl, {
    method: "POST",
    body: JSON.stringify(newObj),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error(res);
      }
    })
    .then((res) => {
      creatSingleCard(res.data);
      $(function () {
        $('[data-toggle="tooltip"]').tooltip();
      });
    })
    .catch((err) => {
      snackbar(err, "error");
    })
    .finally(() => {
      spinner.classList.add("d-none");
    });
}

function creatSingleCard(data) {
  spinner.classList.remove("d-none");

  let div = document.createElement("div");
  div.className = "col-md-3 mt-4";
  div.id = data.id;
  div.innerHTML = `
    <div class="card">
          <div class="card-header" data-toggle="tooltip" data-placement="top" title="${data.title}">${data.title}</div>
          <div class="card-body">
            <p>${data.body}</p>
            <h6>${data.userId}</h6>
          </div>
          <div class="card-footer d-flex justify-content-between">
          <button class="btn border-warning" onclick="onEdit(this)"><i class="fa-solid text-warning fa-pen-to-square"></i></button>
          <button class="btn border-danger" onclick="onDelete(this)"><i class="fa-solid text-danger fa-trash"></i></button>
        </div>
          
    </div>`;

  postContainer.prepend(div);
  postForm.reset();

  snackbar(`New post add with ID ${data.id} successfully`, "success");
}

function updateCard() {
  spinner.classList.remove("d-none");

  let updateObj = {
    title: title.value,
    body: body.value,
    userId: userId.value,
  };
  let updateId = localStorage.getItem("editId");

  let updateUrl = `${baseUrl}/${updateId}`;

  fetch(updateUrl, {
    method: "PATCH",
    body: JSON.stringify(updateObj),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
    })
    .then(() => {
      updateOnUI(updateObj);
      snackbar("Post Update Successfully..", "success");

      $(function () {
        $('[data-toggle="tooltip"]').tooltip();
      });
    })
    .catch((err) => {
      snackbar(err, "error");
    })
    .finally(() => {
      spinner.classList.add("d-none");
    });
}

function updateOnUI(updateObj) {
  let updateId = localStorage.getItem("editId");

  let div = document.getElementById(updateId);

  div.querySelector(".card-header").innerHTML = updateObj.title;
  div.querySelector(".card-body p").innerHTML = updateObj.body;
  div.querySelector(".card-body h6").innerHTML = updateObj.userId;

  postForm.reset();
  snackbar(`Post update with ID ${updateId}`, "success");

  addBtn.classList.remove("d-none");
  updateBtn.classList.add("d-none");

  div.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}

updateBtn.addEventListener("click", updateCard);

function onDelete(ele) {
  spinner.classList.remove("d-none");

  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#00a2ff",
    cancelButtonColor: "rgb(255, 0, 0)",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      let deleteId = ele.closest(".col-md-3").id;

      let deleteUrl = `${baseUrl}/${deleteId}`;

      fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            throw new Error(res);
          }
        })
        .then((data) => {
          document.getElementById(deleteId).remove();
          snackbar(`Post delete with ID ${deleteId}`, "success");
        })
        .catch((err) => {
          snackbar(err, "error");
        })
        .finally(() => {
          spinner.classList.add("d-none");
        });
    } else {
      spinner.classList.add("d-none");
    }
  });
}
postForm.addEventListener("submit", onSubmit);
updateBtn.addEventListener("click", updateCard);
