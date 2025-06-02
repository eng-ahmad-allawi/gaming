// دالة للحصول على التاريخ المعدل (اليوم ينتهي في الساعة 6 صباحًا)
function getAdjustedDate() {
    const now = new Date();
    // إذا كانت الساعة أقل من 6 صباحًا، نعتبر أننا ما زلنا في اليوم السابق
    if (now.getHours() < 6) {
        // نقوم بإرجاع تاريخ اليوم السابق
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday;
    }
    // إذا كانت الساعة 6 صباحًا أو أكثر، نعتبر أننا في اليوم الحالي
    return now;
}

// دالة مسح بيانات الشهر
function clearMonthData() {
    console.log('تنفيذ دالة مسح بيانات الشهر');

    // الحصول على التاريخ المعدل (اليوم ينتهي في الساعة 6 صباحًا)
    const currentDate = getAdjustedDate();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // الحصول على عدد أيام الشهر
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    // الحصول على اسم المستخدم
    const username = localStorage.getItem('username') || 'default';

    // مسح بيانات كل يوم في الشهر
    for (let day = 1; day <= daysInMonth; day++) {
        const dayStorageKey = `${username}_transactions_${currentYear}_${currentMonth}_${day}`;
        localStorage.removeItem(dayStorageKey);
    }

    // مسح أي مفاتيح أخرى متعلقة بالشهر الحالي
    const keys = Object.keys(localStorage);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (key.includes(`${username}_transactions_${currentYear}_${currentMonth}`)) {
            localStorage.removeItem(key);
        }
    }

    // إغلاق المودال
    document.getElementById('clear-month-modal').classList.remove('active');

    // عرض إشعار باستخدام دالة showNotification
    showNotification('تم مسح بيانات الشهر بنجاح');

    // تحديث قائمة المعاملات
    const transactionsList = document.getElementById('transactions-list');
    if (transactionsList) {
        transactionsList.innerHTML = '<div class="no-transactions">لا توجد معاملات لهذا اليوم</div>';
    }

    // تحديث عرض أيام الشهر
    const daysContainer = document.getElementById('days-container');
    if (daysContainer) {
        // إزالة مؤشر وجود بيانات من جميع الأيام
        const dayItems = daysContainer.querySelectorAll('.day-item');
        dayItems.forEach(item => {
            const dayHasData = item.querySelector('.day-has-data');
            if (dayHasData) {
                dayHasData.remove();
            }
        });
    }

    // تصفير إجمالي اليوم
    const totalProfitElement = document.getElementById('total-profit');
    const screensProfitElement = document.getElementById('screens-profit');
    const drinksProfitElement = document.getElementById('drinks-profit');
    const hookahProfitElement = document.getElementById('hookah-profit');
    const transactionsCountElement = document.getElementById('transactions-count');

    if (totalProfitElement) totalProfitElement.textContent = '0 ل.س';
    if (screensProfitElement) screensProfitElement.textContent = '0 ل.س';
    if (drinksProfitElement) drinksProfitElement.textContent = '0 ل.س';
    if (hookahProfitElement) hookahProfitElement.textContent = '0 ل.س';
    if (transactionsCountElement) transactionsCountElement.textContent = '0';

    // تصفير إجمالي الشهر
    const monthlyScreensTotal = document.getElementById('monthly-screens-total');
    const monthlyDrinksTotal = document.getElementById('monthly-drinks-total');
    const monthlyHookahTotal = document.getElementById('monthly-hookah-total');
    const monthlyTotal = document.getElementById('monthly-total');

    if (monthlyScreensTotal) monthlyScreensTotal.textContent = '0 ل.س';
    if (monthlyDrinksTotal) monthlyDrinksTotal.textContent = '0 ل.س';
    if (monthlyHookahTotal) monthlyHookahTotal.textContent = '0 ل.س';
    if (monthlyTotal) monthlyTotal.textContent = '0 ل.س';
}

// دالة مسح سجل المعاملات فقط
function clearAllData() {
    console.log('تنفيذ دالة مسح سجل المعاملات فقط');

    // الحصول على التاريخ المعدل (اليوم ينتهي في الساعة 6 صباحًا)
    const currentDate = getAdjustedDate();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    // الحصول على مفتاح التخزين لليوم الحالي
    const username = localStorage.getItem('username') || 'default';
    const storageKey = `${username}_transactions_${currentYear}_${currentMonth}_${currentDay}`;

    // إنشاء مفتاح تخزين جديد للأرباح المحفوظة
    const profitsStorageKey = `${username}_profits_${currentYear}_${currentMonth}_${currentDay}`;

    // حفظ الأرباح الحالية قبل مسح المعاملات
    const dailyProfits = {
        screensProfit: 0,
        drinksProfit: 0,
        hookahProfit: 0,
        totalProfit: 0,
        screenTransactionsCount: 0
    };

    // الحصول على قيم الأرباح الحالية من واجهة المستخدم
    const totalProfitElement = document.getElementById('total-profit');
    const screensProfitElement = document.getElementById('screens-profit');
    const drinksProfitElement = document.getElementById('drinks-profit');
    const hookahProfitElement = document.getElementById('hookah-profit');
    const transactionsCountElement = document.getElementById('transactions-count');

    if (totalProfitElement) {
        dailyProfits.totalProfit = parseInt(totalProfitElement.textContent.replace(/[^\d]/g, '')) || 0;
    }
    if (screensProfitElement) {
        dailyProfits.screensProfit = parseInt(screensProfitElement.textContent.replace(/[^\d]/g, '')) || 0;
    }
    if (drinksProfitElement) {
        dailyProfits.drinksProfit = parseInt(drinksProfitElement.textContent.replace(/[^\d]/g, '')) || 0;
    }
    if (hookahProfitElement) {
        dailyProfits.hookahProfit = parseInt(hookahProfitElement.textContent.replace(/[^\d]/g, '')) || 0;
    }
    if (transactionsCountElement) {
        dailyProfits.screenTransactionsCount = parseInt(transactionsCountElement.textContent) || 0;
    }

    // حفظ الأرباح في localStorage
    localStorage.setItem(profitsStorageKey, JSON.stringify(dailyProfits));

    // مسح سجل المعاملات فقط
    localStorage.removeItem(storageKey);

    // إغلاق المودال
    document.getElementById('clear-data-modal').classList.remove('active');

    // عرض إشعار باستخدام دالة showNotification
    showNotification('تم مسح سجل المعاملات بنجاح');

    // تحديث قائمة المعاملات - إظهار رسالة "لا توجد معاملات"
    const transactionsList = document.getElementById('transactions-list');
    if (transactionsList) {
        transactionsList.innerHTML = '<div class="no-transactions">لا توجد معاملات لهذا اليوم</div>';
    }

    // تحديث عرض أيام الشهر - إزالة مؤشر وجود بيانات من اليوم الحالي
    const daysContainer = document.getElementById('days-container');
    if (daysContainer) {
        const currentDayItem = Array.from(daysContainer.querySelectorAll('.day-item')).find(item => {
            const dayNumber = item.querySelector('.day-number').textContent;
            return parseInt(dayNumber) === currentDay;
        });

        if (currentDayItem) {
            const dayHasData = currentDayItem.querySelector('.day-has-data');
            if (dayHasData) {
                dayHasData.remove();
            }
        }
    }

    // إعادة عرض الأرباح اليومية المحفوظة
    if (totalProfitElement) totalProfitElement.textContent = dailyProfits.totalProfit.toLocaleString() + ' ل.س';
    if (screensProfitElement) screensProfitElement.textContent = dailyProfits.screensProfit.toLocaleString() + ' ل.س';
    if (drinksProfitElement) drinksProfitElement.textContent = dailyProfits.drinksProfit.toLocaleString() + ' ل.س';
    if (hookahProfitElement) hookahProfitElement.textContent = dailyProfits.hookahProfit.toLocaleString() + ' ل.س';
    if (transactionsCountElement) transactionsCountElement.textContent = dailyProfits.screenTransactionsCount;

    // الحفاظ على الأرباح الشهرية - لا نقوم بأي تغيير عليها
    console.log('تم الحفاظ على الأرباح اليومية والشهرية بنجاح');
}

// تم حذف دالة updateMonthlySummaryAfterClear لأنها غير مستخدمة

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // الحصول على عناصر مودال مسح سجل المعاملات
    const clearDataModal = document.getElementById('clear-data-modal');
    const confirmBtn = document.getElementById('confirm-clear-data-btn');
    const cancelBtn = document.getElementById('cancel-clear-data-btn');
    const closeBtn = document.getElementById('close-clear-data-btn');

    // إضافة مستمع حدث لزر التأكيد
    confirmBtn.addEventListener('click', clearAllData);

    // إضافة مستمع حدث لزر الإلغاء
    cancelBtn.addEventListener('click', function() {
        clearDataModal.classList.remove('active');
    });

    // إضافة مستمع حدث لزر الإغلاق
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            clearDataModal.classList.remove('active');
        });
    }

    // إضافة مستمع حدث للنقر خارج المودال
    clearDataModal.addEventListener('click', function(e) {
        if (e.target === clearDataModal) {
            clearDataModal.classList.remove('active');
        }
    });

    // الحصول على عناصر مودال مسح بيانات الشهر
    const clearMonthModal = document.getElementById('clear-month-modal');
    const confirmMonthBtn = document.getElementById('confirm-clear-month-btn');
    const cancelMonthBtn = document.getElementById('cancel-clear-month-btn');
    const closeMonthBtn = document.getElementById('close-clear-month-btn');

    // إضافة مستمع حدث لزر التأكيد
    if (confirmMonthBtn) {
        confirmMonthBtn.addEventListener('click', clearMonthData);
    }

    // إضافة مستمع حدث لزر الإلغاء
    if (cancelMonthBtn) {
        cancelMonthBtn.addEventListener('click', function() {
            clearMonthModal.classList.remove('active');
        });
    }

    // إضافة مستمع حدث لزر الإغلاق
    if (closeMonthBtn) {
        closeMonthBtn.addEventListener('click', function() {
            clearMonthModal.classList.remove('active');
        });
    }

    // إضافة مستمع حدث للنقر خارج المودال
    if (clearMonthModal) {
        clearMonthModal.addEventListener('click', function(e) {
            if (e.target === clearMonthModal) {
                clearMonthModal.classList.remove('active');
            }
        });
    }
});
