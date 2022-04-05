let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("new_budget", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.online) {
    uploadItem(); //uploadPizza
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["new_budget"], "readwrite");
  console.log(transaction);
  const ItemObjectStore = transaction.objectStore("new_budget"); //pizzaobjectstore

  ItemObjectStore.add(record); //pizzaObjectStore
}

function uploadItem() { //uploadPizza
  const transaction = db.transaction(["new_budget"], "readwrite");
  const itemObjectStore = transaction.objectStore("new-budget"); //pizzaobjectstore

  const getAll = itemObjectStore.getAll(); //pizzaobjectstore

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          const transaction = db.transaction(["newBudget"], "readwrite");
          const itemObjectStore = transaction.objectStore("newBudget");
          itemObjectStore.clear();
          alert("All transactions submitted");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

window.addEventListener("online", uploadItem);