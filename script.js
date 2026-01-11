document.addEventListener("DOMContentLoaded", function () {

    var categoriesContainer = document.getElementById("categoriesContainer");
    var itemsContainer = document.getElementById("itemsContainer");
    var orderContainer = document.getElementById("orderContainer");
    var orderTotalDiv = document.getElementById("orderTotal");
    var sendButton = document.getElementById("sendOrder");
    var backButton = document.getElementById("backToCategories");

    var orderTypeSelect = document.getElementById("orderType");
    var tableDiv = document.getElementById("tableDiv");
    var phoneDiv = document.getElementById("phoneDiv");
    var addressDiv = document.getElementById("addressDiv");
    var deliveryCostDiv = document.getElementById("deliveryCostDiv");

    var tableNumberInput = document.getElementById("tableNumber");
    var customerPhoneInput = document.getElementById("customerPhone");
    var customerAddressInput = document.getElementById("customerAddress");
    var deliveryCostInput = document.getElementById("deliveryCost");
    var notesInput = document.getElementById("notes");

    var currentOrderItems = [];

    const API_BASE = window.location.origin;
    // ===== نوع الطلب =====
    orderTypeSelect.addEventListener("change", function () {
        var type = parseInt(orderTypeSelect.value);

        tableDiv.style.display = (type === 1) ? "block" : "none";
        phoneDiv.style.display = (type !== 1) ? "block" : "none";
        addressDiv.style.display = (type !== 1) ? "block" : "none";
        deliveryCostDiv.style.display = (type === 3) ? "block" : "none";
    });

    fetch(API_BASE + "/api/categories")
        .then(function (res) { return res.json(); })
        .then(function (categories) {
            categoriesContainer.innerHTML = "";
            for (var i = 0; i < categories.length; i++) {
                (function (cat) {
                    var btn = document.createElement("button");
                    btn.className = "Category-btn";
                    btn.textContent = cat.categoryName; // اسم الفئة يظهر هنا
                    btn.onclick = function () {
                        loadItems(cat.categoryID); // عند الضغط على الزر تستدعي الأصناف
                    };
                    categoriesContainer.appendChild(btn);
                })(categories[i]);
            }
        })
        .catch(function (err) {
            console.error("خطأ الفئات", err);
        });

    // ===== جلب الأصناف =====
    function loadItems(categoryId) {
        itemsContainer.innerHTML = "";
        categoriesContainer.style.display = "none";
        backButton.style.display = "block";

        fetch(API_BASE + "/api/items?categoryId=" + categoryId)
            .then(function (res) { return res.json(); })
            .then(function (items) {
                for (var i = 0; i < items.length; i++) {
                    (function (item) {
                        var btn = document.createElement("button");
                        btn.className = "item-btn";
                        btn.textContent = item.itemName + " - " + item.price + " د.ع";
                        btn.onclick = function () {
                            addToOrder(item);
                        };
                        itemsContainer.appendChild(btn);
                    })(items[i]);
                }
            });
    }
    backButton.addEventListener("click", function () {
        itemsContainer.innerHTML = "";
        categoriesContainer.style.display = "grid";
        backButton.style.display = "none";
    });

    // ===== إضافة صنف =====
    function addToOrder(item) {
        var found = false;

        for (var i = 0; i < currentOrderItems.length; i++) {
            if (currentOrderItems[i].itemID === item.itemID) {
                currentOrderItems[i].qty++;
                found = true;
                break;
            }
        }

        if (!found) {
            currentOrderItems.push({
                itemID: item.itemID,
                itemName: item.itemName,
                price: item.price,
                qty: 1
            });
        }

        renderOrder();
    }

    // ===== عرض الطلب =====
    function renderOrder() {
        orderContainer.innerHTML = "";
        var total = 0;

        for (var i = 0; i < currentOrderItems.length; i++) {
            (function (index) {
                var it = currentOrderItems[index];
                total += it.price * it.qty;

                var row = document.createElement("div");
                row.className = "order-item";

                row.innerHTML =
                    "<span>" + it.itemName + " × " + it.qty + "</span>" +
                    "<span>" +
                    (it.price * it.qty) + " د.ع " +
                    "<button style='background:red;color:#fff;border:none;" +
                    "border-radius:6px;padding:4px 8px;margin-right:6px;" +
                    "cursor:pointer'>❌</button>" +
                    "</span>";

                // زر الحذف
                row.querySelector("button").onclick = function () {
                    currentOrderItems[index].qty--;
                    if (currentOrderItems[index].qty <= 0) {
                        currentOrderItems.splice(index, 1);
                    }
                    renderOrder();
                };

                orderContainer.appendChild(row);
            })(i);
        }

        if (parseInt(orderTypeSelect.value) === 3) {
            total += parseFloat(deliveryCostInput.value || 0);
        }

        orderTotalDiv.textContent = "المجموع: " + total + " د.ع";
    }

    // ===== إرسال الطلب =====
    sendButton.addEventListener("click", function () {

        if (currentOrderItems.length === 0) {
            alert("اختر أصناف أولاً");
            return;
        }

        var orderData = {
            OrderType: parseInt(orderTypeSelect.value),
            TableNumber: tableNumberInput.value || null,
            CustomerPhone: customerPhoneInput.value,
            CustomerAddress: customerAddressInput.value,
            DeliveryCost: deliveryCostInput.value || 0,
            Notes: notesInput.value,
            PrintStatus: 0,
            Items: currentOrderItems
        };

        fetch(API_BASE + "/api/orders/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData)
        })
            .then(function (r) { return r.json(); })
            .then(function () {
                alert("تم إرسال الطلب ✅");
                currentOrderItems = [];
                renderOrder();
            });
    });

});
