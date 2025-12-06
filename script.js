document.addEventListener("DOMContentLoaded", function () {

    var categoriesContainer = document.getElementById("categoriesContainer");
    var itemsContainer = document.getElementById("itemsContainer");
    var orderContainer = document.getElementById("orderContainer");
    var orderTotalDiv = document.getElementById("orderTotal");
    var sendButton = document.getElementById("sendOrder");

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

    var API_BASE = "https://localhost:7173";

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
        console.error("خطأ الفئات", err);
    });

    // ===== جلب الأصناف =====
    function loadItems(categoryId) {
        itemsContainer.innerHTML = "";

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
            })
            .catch(function (err) {
                console.error("خطأ الأصناف", err);
            });
    }

    // ===== إضافة صنف =====
    function addToOrder(item) {
        var found = false;

        for (var i = 0; i < currentOrderItems.length; i++) {
            if (currentOrderItems[i].ItemID === item.ItemID) {
                currentOrderItems[i].Qty++;
                found = true;
                break;
            }
        }

        if (!found) {
            currentOrderItems.push({
                ItemID: item.ItemID,
                ItemName: item.ItemName,
                Price: item.Price,
                Qty: 1
            });
        }

        renderOrder();
    }

    // ===== عرض الطلب =====
    function renderOrder() {
        orderContainer.innerHTML = "";
        var total = 0;

        for (var i = 0; i < currentOrderItems.length; i++) {
            var it = currentOrderItems[i];
            total += it.Price * it.Qty;

            var row = document.createElement("div");
            row.className = "order-item";
            row.innerHTML =
                "<span>" + it.ItemName + " × " + it.Qty + "</span>" +
                "<span>" + (it.Price * it.Qty) + " د.ع</span>";

            orderContainer.appendChild(row);
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
