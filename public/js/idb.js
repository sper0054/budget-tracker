let db;
const request = indexedDB.open("budget_tracker", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("new_budget", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.online) {
    uploadBudget(); 
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["new_budget"], "readwrite");
  console.log(transaction);
  const BudgetObjectStore = transaction.objectStore("new_budget"); 

  BudgetObjectStore.add(record);
}

function uploadBudget() { 
  const transaction = db.transaction(["new_budget"], "readwrite");
  const BudgetObjectStore = transaction.objectStore("new_budget"); 

  const getAll = BudgetObjectStore.getAll();

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
          const transaction = db.transaction(["new_budget"], "readwrite");
          const BudgetObjectStore = transaction.objectStore("new_budget");
          BudgetObjectStore.clear(); 
          alert("All transactions submitted");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

window.addEventListener("online", uploadItem);