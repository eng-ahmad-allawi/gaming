// منع النقر بزر الماوس الأيمن
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
}, false);

// منع مفاتيح التحكم مثل F12 وCtrl+Shift+I
document.addEventListener('keydown', function(e) {
    // F12
    if (e.keyCode === 123) {
        e.preventDefault();
        return false;
    }

    // Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        return false;
    }

    // Ctrl+Shift+J
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        return false;
    }

    // Ctrl+U
    if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
    }
}, false);

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const rateInputArea = document.getElementById('rate-input-area');
    const rateDisplayArea = document.getElementById('rate-display-area');
    const saveRateBtn = document.getElementById('save-rate-btn');
    const editRateBtn = document.getElementById('edit-rate-btn');
    const screensContainer = document.getElementById('screens-container');
    const warningMessage = document.getElementById('warning-message');
    const damascusTimeElement = document.getElementById('damascus-time');
    const activeScreensCountElement = document.querySelector('#active-screens-count span');
    const resetAllScreensBtn = document.getElementById('reset-all-screens-btn');
    const testBtn = document.querySelector('.test-btn');

    // --- Login Elements ---
    const loginModalOverlay = document.getElementById('login-modal-overlay');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('login-error');

    // --- Utility function to get storage keys specific to each user ---
    function getUserStorageKey(baseKey) {
        const username = localStorage.getItem('username') || 'default';
        return `${username}_${baseKey}`;
    }

    // Drinks Modal Elements
    const drinksModalOverlay = document.getElementById('drinks-modal-overlay');
    const drinksModalTitle = document.getElementById('drinks-modal-title');
    const drinksCostInput = document.getElementById('drinks-cost-input');
    const addDrinksBtn = document.getElementById('add-drinks-btn');
    const cancelDrinksBtn = document.getElementById('cancel-drinks-btn');
    const closeDrinksModalBtn = document.getElementById('close-drinks-modal-btn');

    // Hookah Modal Elements
    const hookahModalOverlay = document.getElementById('hookah-modal-overlay');
    const hookahModalTitle = document.getElementById('hookah-modal-title');
    const hookahCostInput = document.getElementById('hookah-cost-input');
    const addHookahBtn = document.getElementById('add-hookah-btn');
    const cancelHookahBtn = document.getElementById('cancel-hookah-btn');
    const closeHookahModalBtn = document.getElementById('close-hookah-modal-btn');

    // Previous Bill Modal Elements
    const previousBillModalOverlay = document.getElementById('previous-bill-modal-overlay');
    const previousBillModalTitle = document.getElementById('previous-bill-modal-title');
    const previousBillCostInput = document.getElementById('previous-bill-cost-input');
    const addPreviousBillBtn = document.getElementById('add-previous-bill-btn');
    const cancelPreviousBillBtn = document.getElementById('cancel-previous-bill-btn');
    const closePreviousBillModalBtn = document.getElementById('close-previous-bill-modal-btn');

    // Timer Modal Elements
    const timerModalOverlay = document.getElementById('timer-modal-overlay');
    const timerModalTitle = document.getElementById('timer-modal-title');
    const timerOptions = document.querySelectorAll('.timer-option');
    const minutesInputGroup = document.getElementById('minutes-input-group');
    const costInputGroup = document.getElementById('cost-input-group');
    const minutesInput = document.getElementById('minutes-input');
    const costInput = document.getElementById('cost-input');
    const calculatedTime = document.getElementById('calculated-time');
    const startTimerBtn = document.getElementById('start-timer-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // Confirm Reset Modal Elements
    const confirmResetOverlay = document.getElementById('confirm-reset-overlay');
    const confirmResetBtn = document.getElementById('confirm-reset-btn');
    const cancelResetBtn = document.getElementById('cancel-reset-btn');
    const closeConfirmBtn = document.getElementById('close-confirm-btn');

    // Confirm Reset All Modal Elements
    const confirmResetAllOverlay = document.getElementById('confirm-reset-all-overlay');
    const confirmResetAllBtn = document.getElementById('confirm-reset-all-btn');
    const cancelResetAllBtn = document.getElementById('cancel-reset-all-btn');
    const closeConfirmAllBtn = document.getElementById('close-confirm-all-btn');

    // Notification Elements
    const notificationsContainer = document.getElementById('notifications-container');

    // --- State Variables ---
    let hourlyRate = null; // سعر الثنائي PS4
    let tripleHourlyRate = null; // سعر الثلاثي PS4
    let quadHourlyRate = null; // سعر الرباعي PS4
    let ps5HourlyRate = null; // سعر الثنائي PS5
    let ps5TripleHourlyRate = null; // سعر الثلاثي PS5
    let ps5QuadHourlyRate = null; // سعر الرباعي PS5
    const screenTimers = {}; // Stores interval IDs and start times: { screenId: { intervalId: null, startTime: null, elapsedSeconds: 0 } }
    const countdownTimers = {}; // Stores countdown timers: { screenId: { intervalId: null, endTime: null, totalSeconds: 0 } }
    const drinksCosts = {}; // Stores drinks costs for each screen: { screenId: [cost1, cost2, ...] }
    const hookahCosts = {}; // Stores hookah costs for each screen: { screenId: [cost1, cost2, ...] }
    const screenModes = {}; // Stores screen modes: { screenId: string } - "dual", "triple", or "quad"
    const paymentStatus = {}; // Stores payment status for each screen: { screenId: boolean } - true for paid, false for unpaid
    
    // تحديد أنواع الشاشات (PS4/PS5)
    const screenTypes = {
        "1": "ps5",
        "2": "ps5",
        "3": "ps4",
        "4": "ps4",
        "5": "ps4",
        "6": "ps4"
    };

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

    // مفتاح التخزين للشهر الحالي للمعاملات
    const currentDate = getAdjustedDate();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // الشهور تبدأ من 0
    const currentDay = currentDate.getDate();

    // دالة للحصول على مفتاح التخزين للشهر
    function getMonthTransactionsStorageKey(year, month) {
        const username = localStorage.getItem('username') || 'default';
        return `${username}_transactions_${year}_${month}`;
    }

    // دالة للحصول على مفتاح التخزين لليوم
    function getDayTransactionsStorageKey(year, month, day) {
        const username = localStorage.getItem('username') || 'default';
        return `${username}_transactions_${year}_${month}_${day}`;
    }

    // استخدام مفتاح التخزين لليوم الحالي كمفتاح افتراضي
    let storageKey = getDayTransactionsStorageKey(currentYear, currentMonth, currentDay);

    // Función para registrar una transacción
    function recordTransaction(screenId, type, cost, duration = null) {
        // Obtener la fecha actual ajustada (el día termina a las 6 AM)
        const currentDate = getAdjustedDate();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // Los meses comienzan en 0
        const day = currentDate.getDate();
        
        // Crear el objeto de transacción
        const transaction = {
            id: Date.now().toString(),
            screenNumber: screenId,
            type: type,
            cost: cost,
            time: new Date().toISOString(),
            endTime: new Date().toISOString(), // وقت الانتهاء (سيتم تحديثه لاحقًا في حالة الشاشة)
            screenMode: screenModes[screenId] || "dual", // إضافة نوع الحجز (ثنائي/ثلاثي/رباعي)
            screenType: screenTypes[screenId] || "ps4" // نوع الجهاز PS4/PS5
        };
        
        // Agregar la duración si está disponible
        if (duration !== null) {
            transaction.duration = Math.round(duration / 60); // Convertir segundos a minutos
        }
        
        // إذا كان هذا المؤقت العادي، نحدد وقت البدء والانتهاء
        if (type === 'screen' && screenTimers[screenId]) {
            // تحديد وقت البدء من بيانات المؤقت
            if (screenTimers[screenId].startTime) {
                transaction.startTime = new Date(screenTimers[screenId].startTime).toISOString();
            }
        }
        
        // إذا كان هذا مؤقت العد التنازلي، نحدد وقت البدء والانتهاء
        if (type === 'screen' && countdownTimers[screenId]) {
            // حساب وقت البدء (وقت الانتهاء - إجمالي الثواني)
            if (countdownTimers[screenId].endTime && countdownTimers[screenId].totalSeconds) {
                const startTimeMs = countdownTimers[screenId].endTime - (countdownTimers[screenId].totalSeconds * 1000);
                transaction.startTime = new Date(startTimeMs).toISOString();
                transaction.endTime = new Date(countdownTimers[screenId].endTime).toISOString();
            }
        }
        
        // Obtener las transacciones existentes para el día actual
        const transactions = getTransactions(year, month, day);
        
        // Agregar la nueva transacción
        transactions.push(transaction);
        
        // Guardar las transacciones actualizadas
        const dayStorageKey = getDayTransactionsStorageKey(year, month, day);
        localStorage.setItem(dayStorageKey, JSON.stringify(transactions));
        
        // ملاحظة: التحديث الفوري للأرباح سيتم من خلال الدوال التي تستدعي هذه الدالة
    }

    // Función para obtener transacciones
    function getTransactions(year, month, day = null) {
        let storageKey;
        
        if (day !== null) {
            // Obtener transacciones para un día específico
            storageKey = getDayTransactionsStorageKey(year, month, day);
            
            // Obtener las transacciones del almacenamiento local
            const storedTransactions = localStorage.getItem(storageKey);
            
            if (storedTransactions) {
                try {
                    return JSON.parse(storedTransactions);
                } catch (error) {
                    console.error('Error parsing transactions:', error);
                    return [];
                }
            }
            
            return [];
        } else {
            // Obtener todas las transacciones del mes
            const transactions = [];
            
            // Determinar cuántos días tiene el mes
            const daysInMonth = new Date(year, month, 0).getDate();
            
            // Recorrer cada día del mes
            for (let i = 1; i <= daysInMonth; i++) {
                const dayKey = getDayTransactionsStorageKey(year, month, i);
                const dayTransactions = localStorage.getItem(dayKey);
                
                if (dayTransactions) {
                    try {
                        const parsedTransactions = JSON.parse(dayTransactions);
                        transactions.push(...parsedTransactions);
                    } catch (error) {
                        console.error(`Error parsing transactions for day ${i}:`, error);
                    }
                }
            }
            
            return transactions;
        }
    }

    // --- Authentication System ---
    function checkAuthentication() {
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        if (isAuthenticated === 'true') {
            // User already authenticated, hide login modal
            loginModalOverlay.style.display = 'none';
            return true;
        } else {
            // User not authenticated, show login modal
            loginModalOverlay.style.display = 'flex';
            return false;
        }
    }

    // دالة لإنشاء معرف فريد للجهاز
    function generateDeviceId() {
        // استخدام معلومات المتصفح والشاشة لإنشاء معرف شبه فريد
        const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
        const browserInfo = navigator.userAgent;
        const timeStamp = new Date().getTime();

        // دمج المعلومات وإنشاء هاش بسيط
        const rawId = `${screenInfo}-${browserInfo}-${timeStamp}`;
        let hash = 0;
        for (let i = 0; i < rawId.length; i++) {
            const char = rawId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // تحويل إلى 32bit integer
        }

        // تحويل الهاش إلى سلسلة نصية إيجابية
        return Math.abs(hash).toString(16);
    }

    function setupLoginSystem() {
        console.log('Setting up simplified login system...');

        // Define users directly in the code
        const hardcodedUsers = [
            { username: "admin", password: "admin345" }
        ];

        console.log('Hardcoded users:', hardcodedUsers);

        // Configure the form submission event
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            console.log('Login attempt with:', username, password);

            // Find the user in the hardcoded users array
            const user = hardcodedUsers.find(u => u.username === username && u.password === password);
            console.log('User found:', user);

            if (user) {
                // التحقق من معرف الجهاز
                const storedDeviceId = localStorage.getItem('deviceId');
                const currentDeviceId = generateDeviceId();

                // التحقق من معرف الجهاز للسماح بتسجيل الدخول من جهاز واحد فقط
                if (storedDeviceId && storedDeviceId !== currentDeviceId) {
                    // إذا كان هناك معرف جهاز مخزن وهو مختلف عن المعرف الحالي
                    loginError.textContent = 'هذا الحساب مرتبط بجهاز آخر. لا يمكن استخدامه على هذا الجهاز.';
                    loginError.classList.add('visible');

                    // إخفاء رسالة الخطأ بعد 5 ثوان
                    setTimeout(() => {
                        loginError.classList.remove('visible');
                        loginError.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
                    }, 5000);

                    return;
                }

                // تخزين معرف الجهاز إذا لم يكن موجودًا
                if (!storedDeviceId) {
                    localStorage.setItem('deviceId', currentDeviceId);
                }

                // Successful authentication
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('username', username);

                // Update the storage key for transactions
                storageKey = getDayTransactionsStorageKey(currentYear, currentMonth, currentDay);

                // Hide login modal
                loginModalOverlay.style.display = 'none';

                // Initialize the application
                initializeApp();
            } else {
                // Show error
                loginError.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
                loginError.classList.add('visible');

                // Hide error message after 3 seconds
                setTimeout(() => {
                    loginError.classList.remove('visible');
                }, 3000);
            }
        });
    }

    // --- Initialization ---
    function initialize() {
        // التحقق من تسجيل الدخول
        if (checkAuthentication()) {
            // بدء تشغيل التطبيق الرئيسي
            initializeApp();
            
            // التحقق مما إذا كنا نحتاج للعودة إلى الصفحة الرئيسية بعد مسح بيانات الشهر
            if (localStorage.getItem('returnToMainView') === 'true') {
                // حذف العلامة من التخزين المحلي
                localStorage.removeItem('returnToMainView');
                
                // إظهار الصفحة الرئيسية (شاشات اللعب) وإخفاء صفحة الأرباح
                document.getElementById('main-app-view').classList.remove('hidden');
                document.getElementById('profits-view').classList.add('hidden');
            }
        } else {
            // إظهار شاشة تسجيل الدخول إذا لم يكن هناك تسجيل دخول
            setupLoginSystem();
        }
    }

    // وظيفة لتحديث واجهة المستخدم لحالة الدفع
    function updatePaymentStatusUI() {
        // تحديث مؤشر الدفع لكل شاشة
        for (const screenId in paymentStatus) {
            const card = document.querySelector(`.screen-card[data-screen-id="${screenId}"]`);
            if (card) {
                const statusIndicator = card.querySelector('.payment-status');
                if (statusIndicator) {
                    if (paymentStatus[screenId]) {
                        // مدفوع
                        statusIndicator.classList.remove('unpaid');
                        statusIndicator.classList.add('paid');
                        statusIndicator.innerHTML = '<i class="fas fa-check"></i>';
                        statusIndicator.title = 'انقر لتغيير حالة الدفع (مدفوع)';
                    } else {
                        // غير مدفوع
                        statusIndicator.classList.remove('paid');
                        statusIndicator.classList.add('unpaid');
                        statusIndicator.innerHTML = '<i class="fas fa-times"></i>';
                        statusIndicator.title = 'انقر لتغيير حالة الدفع (غير مدفوع)';
                    }
                }
            }
        }
    }

    // وظيفة لتهيئة مؤشرات حالة الدفع
    function initializePaymentStatus() {
        // تهيئة حالة الدفع لكل شاشة
        const screenCards = document.querySelectorAll('.screen-card');
        screenCards.forEach(card => {
            const screenId = card.dataset.screenId;
            // تعيين حالة الدفع الافتراضية إلى "غير مدفوع"
            paymentStatus[screenId] = false;
        });

        // استعادة حالة الدفع المحفوظة
        restorePaymentStatus();
    }

    // دالة لحفظ حالة الدفع في localStorage
    function savePaymentStatus() {
        localStorage.setItem(getUserStorageKey('paymentStatus'), JSON.stringify(paymentStatus));
    }

    // دالة لاستعادة حالة الدفع من localStorage
    function restorePaymentStatus() {
        const savedPaymentStatus = localStorage.getItem(getUserStorageKey('paymentStatus'));
        if (!savedPaymentStatus) return;

        try {
            const savedStatus = JSON.parse(savedPaymentStatus);
            Object.assign(paymentStatus, savedStatus);
            updatePaymentStatusUI();
        } catch (error) {
            console.error('Error restoring payment status:', error);
        }
    }

    function initializeApp() {
        // Load rates from localStorage using user-specific keys
        const savedDualRate = localStorage.getItem(getUserStorageKey('dualHourlyRate'));
        const savedTripleRate = localStorage.getItem(getUserStorageKey('tripleHourlyRate'));
        const savedQuadRate = localStorage.getItem(getUserStorageKey('quadHourlyRate'));
        
        // تحميل أسعار PS5
        const savedPS5DualRate = localStorage.getItem(getUserStorageKey('ps5DualHourlyRate'));
        const savedPS5TripleRate = localStorage.getItem(getUserStorageKey('ps5TripleHourlyRate'));
        const savedPS5QuadRate = localStorage.getItem(getUserStorageKey('ps5QuadHourlyRate'));

        if (savedDualRate) {
            // تهيئة أسعار PS4
            hourlyRate = parseFloat(savedDualRate);
            tripleHourlyRate = parseFloat(savedTripleRate || (hourlyRate * 1.25)); // If no triple rate, use 1.25x the dual rate
            quadHourlyRate = parseFloat(savedQuadRate || (hourlyRate * 1.5)); // Si no hay tasa quad, usar 1.5x la tasa dual
            
            // تهيئة أسعار PS5
            // إذا لم تكن أسعار PS5 محفوظة، نستخدم أسعار PS4 بزيادة 25%
            ps5HourlyRate = parseFloat(savedPS5DualRate || (hourlyRate * 1.25));
            ps5TripleHourlyRate = parseFloat(savedPS5TripleRate || (tripleHourlyRate * 1.25));
            ps5QuadHourlyRate = parseFloat(savedPS5QuadRate || (quadHourlyRate * 1.25));
            
            updateRateUI(true); // Rate exists
            activateScreens();

            // تحديث عرض أرقام المشروبات والأراكيل لجميع الشاشات (6 شاشات)
            for (let i = 1; i <= 6; i++) {
                updateDrinksValues(i);
                updateHookahValues(i);
            }
        } else {
            updateRateUI(false); // Rate does not exist
            deactivateScreens();
            warningMessage.classList.add('visible');
        }

        // Start Damascus time clock
        updateDamascusTime();
        setInterval(updateDamascusTime, 1000);

        // Start active screens counter
        updateActiveScreensCount();
        setInterval(updateActiveScreensCount, 2000);

        // تهيئة مؤشرات حالة الدفع
        initializePaymentStatus();

        // استعادة حالة المؤقتات إذا كان المستخدم قد عاد من صفحة الأرباح
        restoreTimersState();

        // منع إعادة تحميل الصفحة بدون تأكيد المستخدم
        window.addEventListener('beforeunload', function(e) {
            // التحقق مما إذا كانت هناك مؤقتات نشطة
            if (hasActiveTimers()) {
                // رسالة التأكيد (لاحظ أن المتصفحات الحديثة تعرض رسالة قياسية بدلاً من الرسالة المخصصة)
                const confirmationMessage = 'هناك مؤقتات نشطة! هل أنت متأكد من مغادرة الصفحة؟ سيتم فقدان جميع البيانات.';

                // للمتصفحات القديمة
                e.returnValue = confirmationMessage;

                // للمتصفحات الحديثة
                return confirmationMessage;
            }
        });

        // Add event listeners
        saveRateBtn.addEventListener('click', handleSaveRate);
        editRateBtn.addEventListener('click', handleEditRate);
        screensContainer.addEventListener('click', handleScreenButtonClick);
        resetAllScreensBtn.addEventListener('click', openConfirmResetAllModal);

        // إضافة مستمع الحدث لرابط صفحة الأرباح
        const profitsLink = document.getElementById('profits-link');
        if (profitsLink) {
            profitsLink.addEventListener('click', function(e) {
                // منع السلوك الافتراضي للرابط
                e.preventDefault();

                // إخفاء العرض الرئيسي وإظهار عرض الأرباح
                document.getElementById('main-app-view').classList.add('hidden');
                const profitsView = document.getElementById('profits-view');
                profitsView.classList.remove('hidden');

                // تأخير قصير ثم إظهار العناصر بتأثير متحرك
                setTimeout(() => {
                    profitsView.classList.add('visible');
                }, 50);

                // تحديث بيانات الأرباح
                updateProfitsData();
                
                // تحديث بيانات الأرباح الشهرية مباشرة دون الحاجة لتحديث الصفحة
                forceUpdateMonthlyProfits();
            });
        }

        // إضافة مستمع الحدث لزر العودة للشاشات
        const backToMainBtn = document.getElementById('back-to-main-btn');
        if (backToMainBtn) {
            backToMainBtn.addEventListener('click', function() {
                // إخفاء عرض الأرباح
                const profitsView = document.getElementById('profits-view');
                profitsView.classList.remove('visible');

                // تأخير قصير ثم إخفاء عرض الأرباح وإظهار العرض الرئيسي
                setTimeout(() => {
                    profitsView.classList.add('hidden');
                    document.getElementById('main-app-view').classList.remove('hidden');
                }, 300);
            });
        }
        
        // إضافة مستمع الحدث لزر تحديث صفحة الأرباح
        const refreshProfitsBtn = document.getElementById('refresh-profits-btn');
        if (refreshProfitsBtn) {
            refreshProfitsBtn.addEventListener('click', function() {
                // تحديث بيانات الأرباح بدون تحديث الصفحة
                forceUpdateMonthlyProfits();
                
                // إظهار إشعار بنجاح عملية التحديث
                showNotification('تم تحديث بيانات الأرباح بنجاح', 'success');
            });
        }

        // دالة لحفظ حالة المؤقتات النشطة في localStorage
        function saveActiveTimersState() {
            const timersState = {
                screenTimers: {},
                countdownTimers: {},
                drinksCosts: {},
                hookahCosts: {},
                previousBills: window.previousBills ? { ...window.previousBills } : {}, // حفظ الفواتير السابقة
                paymentStatus: {...paymentStatus} // حفظ حالة الدفع
            };

            // حفظ بيانات المؤقتات العادية
            for (const screenId in screenTimers) {
                if (screenTimers[screenId] && screenTimers[screenId].intervalId) {
                    timersState.screenTimers[screenId] = {
                        startTime: screenTimers[screenId].startTime,
                        elapsedSeconds: screenTimers[screenId].elapsedSeconds
                    };
                }
            }

            // حفظ بيانات المؤقتات التنازلية
            for (const screenId in countdownTimers) {
                if (countdownTimers[screenId] && countdownTimers[screenId].intervalId) {
                    timersState.countdownTimers[screenId] = {
                        endTime: countdownTimers[screenId].endTime,
                        totalSeconds: countdownTimers[screenId].totalSeconds,
                        inputCost: countdownTimers[screenId].inputCost
                    };
                }
            }

            // حفظ بيانات المشروبات
            for (const screenId in drinksCosts) {
                if (drinksCosts[screenId] && drinksCosts[screenId].length > 0) {
                    timersState.drinksCosts[screenId] = [...drinksCosts[screenId]];
                }
            }

            // حفظ بيانات الأراكيل
            for (const screenId in hookahCosts) {
                if (hookahCosts[screenId] && hookahCosts[screenId].length > 0) {
                    timersState.hookahCosts[screenId] = [...hookahCosts[screenId]];
                }
            }

            // حفظ البيانات في localStorage con clave específica para cada usuario
            localStorage.setItem(getUserStorageKey('timersState'), JSON.stringify(timersState));
        }

        // دالة لاستعادة حالة المؤقتات من localStorage
        function restoreTimersState() {
            // Usar clave específica para cada usuario
            const savedState = localStorage.getItem(getUserStorageKey('timersState'));
            if (!savedState) {
                // إذا لم تكن هناك حالة محفوظة للمؤقتات، نحاول استعادة حالة الدفع فقط
                restorePaymentStatus();
                return;
            }

            try {
                const timersState = JSON.parse(savedState);

                // استعادة بيانات المؤقتات العادية
                if (timersState.screenTimers) {
                    for (const screenId in timersState.screenTimers) {
                        const screenData = timersState.screenTimers[screenId];
                        const card = document.querySelector(`.screen-card[data-screen-id="${screenId}"]`);
                        if (card) {
                            // استعادة المؤقت
                            startTimer(card, screenId, screenData.startTime, screenData.elapsedSeconds);
                        }
                    }
                }

                // استعادة بيانات المؤقتات التنازلية
                if (timersState.countdownTimers) {
                    for (const screenId in timersState.countdownTimers) {
                        const timerData = timersState.countdownTimers[screenId];
                        const card = document.querySelector(`.screen-card[data-screen-id="${screenId}"]`);
                        if (card) {
                            // استعادة المؤقت التنازلي
                            restoreCountdownTimer(card, screenId, timerData);
                        }
                    }
                }

                // استعادة بيانات المشروبات
                if (timersState.drinksCosts) {
                    for (const screenId in timersState.drinksCosts) {
                        drinksCosts[screenId] = [...timersState.drinksCosts[screenId]];
                        // تحديث عرض قيم المشروبات
                        updateDrinksValues(screenId);
                    }
                }

                // استعادة بيانات الأراكيل
                if (timersState.hookahCosts) {
                    for (const screenId in timersState.hookahCosts) {
                        hookahCosts[screenId] = [...timersState.hookahCosts[screenId]];
                        // تحديث عرض قيم الأراكيل
                        updateHookahValues(screenId);
                    }
                }
                
                // استعادة بيانات الفواتير السابقة
                if (timersState.previousBills) {
                    window.previousBills = timersState.previousBills;
                    // تحديث عرض قيم الفواتير السابقة لكل الشاشات
                    for (const screenId in window.previousBills) {
                        updatePreviousBillValues(screenId);
                    }
                }

                // استعادة حالة الدفع
                if (timersState.paymentStatus) {
                    Object.assign(paymentStatus, timersState.paymentStatus);
                    updatePaymentStatusUI();
                } else {
                    // إذا لم تكن حالة الدفع موجودة في حالة المؤقتات، نحاول استعادتها من التخزين المنفصل
                    restorePaymentStatus();
                }

                // حذف البيانات المحفوظة بعد استعادتها
                localStorage.removeItem(getUserStorageKey('timersState'));

            } catch (error) {
                console.error('Error restoring timers state:', error);
                localStorage.removeItem(getUserStorageKey('timersState'));

                // محاولة استعادة حالة الدفع على الأقل
                restorePaymentStatus();
            }
        }

        // دالة لاستعادة حالة الدفع من localStorage
        function restorePaymentStatus() {
            const savedPaymentStatus = localStorage.getItem(getUserStorageKey('paymentStatus'));
            if (!savedPaymentStatus) return;

            try {
                const savedStatus = JSON.parse(savedPaymentStatus);
                Object.assign(paymentStatus, savedStatus);
                updatePaymentStatusUI();
            } catch (error) {
                console.error('Error restoring payment status:', error);
            }
        }

        // دالة لتحديث بيانات الأرباح
        function updateProfitsData() {
            // الحصول على التاريخ المعدل (اليوم ينتهي في الساعة 6 صباحًا)
            const currentDate = getAdjustedDate();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1;
            const currentDay = currentDate.getDate();

            // الحصول على المعاملات من localStorage لليوم الحالي
            const transactions = getTransactions(currentYear, currentMonth, currentDay);

            // حساب إجمالي الأرباح
            let totalProfit = 0;
            let screensProfit = 0;
            let drinksProfit = 0;
            let hookahProfit = 0;
            let screenTransactionsCount = 0;

            // تحديث ملخص الأرباح
            transactions.forEach(transaction => {
                if (transaction.type === 'screen') {
                    screensProfit += transaction.cost;
                    screenTransactionsCount++;
                } else if (transaction.type === 'drinks') {
                    drinksProfit += transaction.cost;
                } else if (transaction.type === 'hookah') {
                    hookahProfit += transaction.cost;
                }
                totalProfit += transaction.cost;
            });

            // تحديث عناصر واجهة المستخدم
            document.getElementById('total-profit').textContent = totalProfit.toLocaleString() + ' ل.س';
            document.getElementById('screens-profit').textContent = screensProfit.toLocaleString() + ' ل.س';
            document.getElementById('drinks-profit').textContent = drinksProfit.toLocaleString() + ' ل.س';
            document.getElementById('hookah-profit').textContent = hookahProfit.toLocaleString() + ' ل.س';
            document.getElementById('transactions-count').textContent = screenTransactionsCount;

            // تحديث قائمة المعاملات
            updateTransactionsList(transactions);

            // إضافة مستمعات الأحداث للفلاتر
            setupFilters(transactions);

            // تم إزالة زر التحديث

            // إضافة زر مسح بيانات الشهر إلى منطقة الإجراءات
            const profitsActions = document.querySelector('.profits-actions');

            // التحقق من وجود زر مسح بيانات الشهر
            let clearMonthBtn = document.getElementById('clear-month-btn');

            // إذا لم يكن زر مسح بيانات الشهر موجودًا، نقوم بإنشائه
            if (!clearMonthBtn) {
                clearMonthBtn = document.createElement('button');
                clearMonthBtn.id = 'clear-month-btn';
                clearMonthBtn.className = 'btn btn-danger ripple-trigger';
                clearMonthBtn.textContent = 'مسح بيانات الشهر';

                // إضافة الزر إلى منطقة الإجراءات
                profitsActions.appendChild(clearMonthBtn);
            }

            // إزالة جميع مستمعات الأحداث السابقة لزر مسح بيانات الشهر
            const newMonthBtn = clearMonthBtn.cloneNode(true);
            clearMonthBtn.parentNode.replaceChild(newMonthBtn, clearMonthBtn);

            // إضافة مستمع حدث جديد لزر مسح بيانات الشهر
            newMonthBtn.onclick = function() {
                showClearMonthModal();
            };
            
            // تحديث الإجمالي الشهري
            if (typeof window.updateProfitsDisplay === 'function') {
                window.updateProfitsDisplay();
            }
        }

        // دالة لتحديث قائمة المعاملات
        function updateTransactionsList(transactions, typeFilter = 'all', screenFilter = 'all') {
            const transactionsList = document.getElementById('transactions-list');
            transactionsList.innerHTML = '';

            // تطبيق الفلاتر
            let filteredTransactions = transactions;

            if (typeFilter !== 'all') {
                filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
            }

            if (screenFilter !== 'all') {
                filteredTransactions = filteredTransactions.filter(t => t.screenNumber === screenFilter);
            }

            if (filteredTransactions.length === 0) {
                transactionsList.innerHTML = '<div class="no-transactions">لا توجد معاملات تطابق الفلاتر المحددة</div>';
                return;
            }

            // عرض المعاملات بترتيب عكسي (الأحدث أولاً)
            filteredTransactions.slice().reverse().forEach(transaction => {
                const transactionItem = document.createElement('div');
                transactionItem.className = 'transaction-item';
                transactionItem.dataset.transaction = JSON.stringify(transaction);
                transactionItem.dataset.type = transaction.type;
                transactionItem.dataset.screen = transaction.screenNumber;

                // تحديد نوع المعاملة ووقتها
                let typeText = '';
                let timeText = '';
                let durationText = '';

                if (transaction.type === 'screen') {
                    typeText = `شاشة ${transaction.screenNumber}`;
                    timeText = new Date(transaction.time).toLocaleTimeString('ar-SA');

                    // إضافة المدة إذا كانت متوفرة
                    if (transaction.duration !== undefined) {
                        durationText = `<div class="transaction-duration">${transaction.duration} دقيقة</div>`;
                    }
                } else if (transaction.type === 'drinks') {
                    typeText = `مشروبات (شاشة ${transaction.screenNumber})`;
                    timeText = new Date(transaction.time).toLocaleTimeString('ar-SA');
                } else if (transaction.type === 'hookah') {
                    typeText = `أراكيل (شاشة ${transaction.screenNumber})`;
                    timeText = new Date(transaction.time).toLocaleTimeString('ar-SA');
                }

                // إنشاء محتوى العنصر
                transactionItem.innerHTML = `
                    <div class="transaction-info">
                        <div class="transaction-type">${typeText}</div>
                        <div class="transaction-time">${timeText}</div>
                        ${durationText}
                    </div>
                    <div class="transaction-cost">${transaction.cost.toLocaleString()} ل.س</div>
                `;

                // إضافة مستمع حدث للنقر لعرض التفاصيل
                transactionItem.addEventListener('click', function() {
                    showTransactionDetails(transaction);
                });

                // إضافة العنصر إلى القائمة
                transactionsList.appendChild(transactionItem);
            });
        }

        // دالة لإعداد فلاتر المعاملات
        function setupFilters(transactions) {
            const typeFilter = document.getElementById('filter-type');
            const screenFilter = document.getElementById('filter-screen');

            // إزالة مستمعات الأحداث السابقة
            const typeFilterClone = typeFilter.cloneNode(true);
            const screenFilterClone = screenFilter.cloneNode(true);

            typeFilter.parentNode.replaceChild(typeFilterClone, typeFilter);
            screenFilter.parentNode.replaceChild(screenFilterClone, screenFilter);

            // إضافة مستمعات الأحداث الجديدة
            typeFilterClone.addEventListener('change', applyFilters);
            screenFilterClone.addEventListener('change', applyFilters);

            // دالة لتطبيق الفلاتر
            function applyFilters() {
                const typeValue = document.getElementById('filter-type').value;
                const screenValue = document.getElementById('filter-screen').value;
                updateTransactionsList(transactions, typeValue, screenValue);
            }
        }

        // Drinks modal event listeners
        closeDrinksModalBtn.addEventListener('click', closeDrinksModal);
        drinksModalOverlay.addEventListener('click', (e) => {
            if (e.target === drinksModalOverlay) closeDrinksModal();
        });
        addDrinksBtn.addEventListener('click', addDrinksCost);
        cancelDrinksBtn.addEventListener('click', closeDrinksModal);

        // Add Enter key support for drinks cost input
        drinksCostInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                addDrinksCost();
            }
        });

        // Hookah modal event listeners
        closeHookahModalBtn.addEventListener('click', closeHookahModal);
        hookahModalOverlay.addEventListener('click', (e) => {
            if (e.target === hookahModalOverlay) closeHookahModal();
        });
        addHookahBtn.addEventListener('click', addHookahCost);
        cancelHookahBtn.addEventListener('click', closeHookahModal);

        // Add Enter key support for hookah cost input
        hookahCostInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                addHookahCost();
            }
        });

        // Previous Bill modal event listeners
        closePreviousBillModalBtn.addEventListener('click', closePreviousBillModal);
        previousBillModalOverlay.addEventListener('click', (e) => {
            if (e.target === previousBillModalOverlay) closePreviousBillModal();
        });
        addPreviousBillBtn.addEventListener('click', addPreviousBill);
        cancelPreviousBillBtn.addEventListener('click', closePreviousBillModal);

        // Add Enter key support for previous bill cost input
        previousBillCostInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                addPreviousBill();
            }
        });

        // إضافة الاستجابة لمفتاح Enter في حقول أسعار الساعة
        const dualRateInput = document.getElementById('dual-rate-input');
        const tripleRateInput = document.getElementById('triple-rate-input');
        const quadRateInput = document.getElementById('quad-rate-input');

        dualRateInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                // Mover el foco al campo de tarifa triple
                tripleRateInput.focus();
            }
        });

        tripleRateInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                // Mover el foco al campo de tarifa quad
                quadRateInput.focus();
            }
        });

        quadRateInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                handleSaveRate();
            }
        });

        // Timer modal event listeners
        closeModalBtn.addEventListener('click', closeTimerModal);
        timerModalOverlay.addEventListener('click', (e) => {
            if (e.target === timerModalOverlay) closeTimerModal();
        });

        // Confirm reset modal event listeners
        closeConfirmBtn.addEventListener('click', closeConfirmResetModal);
        confirmResetOverlay.addEventListener('click', (e) => {
            if (e.target === confirmResetOverlay) closeConfirmResetModal();
        });
        confirmResetBtn.addEventListener('click', handleConfirmReset);
        cancelResetBtn.addEventListener('click', closeConfirmResetModal);

        // Confirm reset all modal event listeners
        closeConfirmAllBtn.addEventListener('click', closeConfirmResetAllModal);
        confirmResetAllOverlay.addEventListener('click', (e) => {
            if (e.target === confirmResetAllOverlay) closeConfirmResetAllModal();
        });
        confirmResetAllBtn.addEventListener('click', resetAllScreens);
        cancelResetAllBtn.addEventListener('click', closeConfirmResetAllModal);

        // Timer option selection
        timerOptions.forEach(option => {
            option.addEventListener('click', () => {
                timerOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');

                if (option.dataset.option === 'minutes') {
                    minutesInputGroup.classList.remove('hidden');
                    costInputGroup.classList.add('hidden');
                    calculatedTime.classList.add('hidden');
                } else {
                    minutesInputGroup.classList.add('hidden');
                    costInputGroup.classList.remove('hidden');
                }
            });
        });

        // Cost input calculation
        costInput.addEventListener('input', calculateTimeFromCost);

        // إضافة الاستجابة لمفتاح Enter في حقول الإدخال في مودال المؤقت
        minutesInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                startCountdownTimer();
            }
        });

        costInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                startCountdownTimer();
            }
        });

        // Start timer button
        startTimerBtn.addEventListener('click', startCountdownTimer);

        // No need for notification event listener as they are created dynamically

        // Initial reveal animation for the container (if rate exists)
        if (hourlyRate) {
             setTimeout(() => screensContainer.classList.add('visible'), 100); // Small delay
             revealCardsStaggered();
        }

        // Add ripple effect listeners
        addRippleEffect('.ripple-trigger');

        // Add test button functionality (if it exists)
        if (testBtn) {
            testBtn.addEventListener('click', function() {
                showNotification('تم النقر على زر التجربة!');
            });
        }

        // إعداد مستمعات الأحداث لمودال مسح البيانات
        setupClearDataModalListeners();

        // إعداد وظائف العرض الشهري واليومي
        setupMonthlyView();
    }

     // --- Staggered Card Reveal ---
    function revealCardsStaggered() {
        const cards = screensContainer.querySelectorAll('.screen-card');
        cards.forEach((card, index) => {
            // Calculate delay: start quicker, then slow down slightly
            const delay = Math.min(index * 100, 500) + 50; // Max delay 550ms
             setTimeout(() => {
                 card.classList.add('revealed');
             }, delay);
        });
    }

    // --- Rate Management ---
    function updateRateUI(rateExists) {
        if (rateExists) {
            rateInputArea.classList.add('hidden');
            rateDisplayArea.classList.remove('hidden');

            // تحديث عناصر عرض الأسعار لـ PS4
            document.getElementById('dual-rate-display').textContent = Math.round(hourlyRate);
            document.getElementById('triple-rate-display').textContent = Math.round(tripleHourlyRate);
            document.getElementById('quad-rate-display').textContent = Math.round(quadHourlyRate);
            
            // تحديث عناصر عرض الأسعار لـ PS5
            document.getElementById('ps5-dual-rate-display').textContent = Math.round(ps5HourlyRate);
            document.getElementById('ps5-triple-rate-display').textContent = Math.round(ps5TripleHourlyRate);
            document.getElementById('ps5-quad-rate-display').textContent = Math.round(ps5QuadHourlyRate);

            warningMessage.classList.remove('visible'); // Hide warning
            screensContainer.classList.add('visible'); // Show screens container
        } else {
            rateInputArea.classList.remove('hidden');
            rateDisplayArea.classList.add('hidden');

            // مسح حقول الإدخال PS4
            document.getElementById('dual-rate-input').value = '';
            document.getElementById('triple-rate-input').value = '';
            document.getElementById('quad-rate-input').value = '';
            
            // مسح حقول الإدخال PS5
            document.getElementById('ps5-dual-rate-input').value = '';
            document.getElementById('ps5-triple-rate-input').value = '';
            document.getElementById('ps5-quad-rate-input').value = '';

            warningMessage.classList.add('visible'); // Show warning
            screensContainer.classList.remove('visible'); // Hide screens container
            // Ensure cards are hidden if they were revealed before rate reset
            screensContainer.querySelectorAll('.screen-card').forEach(card => card.classList.remove('revealed'));
        }
    }

    function handleSaveRate() {
        // قراءة قيم أسعار PS4
        const dualRateValue = parseFloat(document.getElementById('dual-rate-input').value);
        const tripleRateValue = parseFloat(document.getElementById('triple-rate-input').value);
        const quadRateValue = parseFloat(document.getElementById('quad-rate-input').value);

        // قراءة قيم أسعار PS5
        const ps5DualRateValue = parseFloat(document.getElementById('ps5-dual-rate-input').value);
        const ps5TripleRateValue = parseFloat(document.getElementById('ps5-triple-rate-input').value);
        const ps5QuadRateValue = parseFloat(document.getElementById('ps5-quad-rate-input').value);

        // التحقق من صحة قيم PS4
        const ps4Valid = !isNaN(dualRateValue) && dualRateValue > 0 &&
            !isNaN(tripleRateValue) && tripleRateValue > 0 &&
            !isNaN(quadRateValue) && quadRateValue > 0;
            
        // التحقق من صحة قيم PS5
        const ps5Valid = !isNaN(ps5DualRateValue) && ps5DualRateValue > 0 &&
            !isNaN(ps5TripleRateValue) && ps5TripleRateValue > 0 &&
            !isNaN(ps5QuadRateValue) && ps5QuadRateValue > 0;

        if (ps4Valid && ps5Valid) {
            // حفظ أسعار PS4
            hourlyRate = dualRateValue;
            tripleHourlyRate = tripleRateValue;
            quadHourlyRate = quadRateValue;

            // حفظ أسعار PS5
            ps5HourlyRate = ps5DualRateValue;
            ps5TripleHourlyRate = ps5TripleRateValue;
            ps5QuadHourlyRate = ps5QuadRateValue;

            // حفظ أسعار PS4 في التخزين المحلي
            localStorage.setItem(getUserStorageKey('dualHourlyRate'), hourlyRate.toString());
            localStorage.setItem(getUserStorageKey('tripleHourlyRate'), tripleHourlyRate.toString());
            localStorage.setItem(getUserStorageKey('quadHourlyRate'), quadHourlyRate.toString());
            
            // حفظ أسعار PS5 في التخزين المحلي
            localStorage.setItem(getUserStorageKey('ps5DualHourlyRate'), ps5HourlyRate.toString());
            localStorage.setItem(getUserStorageKey('ps5TripleHourlyRate'), ps5TripleHourlyRate.toString());
            localStorage.setItem(getUserStorageKey('ps5QuadHourlyRate'), ps5QuadHourlyRate.toString());

            updateRateUI(true);
            activateScreens();
            // Reveal cards after saving rate
            setTimeout(() => revealCardsStaggered(), 100);
        } else {
            alert('الرجاء إدخال أسعار صحيحة وأكبر من الصفر لجميع حقول PS4 و PS5.');
            document.getElementById('dual-rate-input').focus();
            
            // إضافة تأثير مرئي للخطأ
            const inputs = [
                { elem: document.getElementById('dual-rate-input'), value: dualRateValue },
                { elem: document.getElementById('triple-rate-input'), value: tripleRateValue },
                { elem: document.getElementById('quad-rate-input'), value: quadRateValue },
                { elem: document.getElementById('ps5-dual-rate-input'), value: ps5DualRateValue },
                { elem: document.getElementById('ps5-triple-rate-input'), value: ps5TripleRateValue },
                { elem: document.getElementById('ps5-quad-rate-input'), value: ps5QuadRateValue }
            ];
            
            inputs.forEach(input => {
                if (isNaN(input.value) || input.value <= 0) {
                    input.elem.style.borderColor = 'var(--error-color)';
                    setTimeout(() => { input.elem.style.borderColor = '' }, 2000);
                }
            });
        }
    }

    // Check if any timers are active
    function hasActiveTimers() {
        // Check regular timers
        for (const screenId in screenTimers) {
            if (screenTimers[screenId] && screenTimers[screenId].intervalId) {
                return true;
            }
        }

        // Check countdown timers
        for (const screenId in countdownTimers) {
            if (countdownTimers[screenId] && countdownTimers[screenId].intervalId) {
                return true;
            }
        }

        return false;
    }

    function handleEditRate() {
        // Check if any timers are active
        if (hasActiveTimers()) {
            // Show notification that rate cannot be edited while timers are active
            showNotification('لا يمكن تعديل سعر الساعة أثناء تشغيل المؤقتات. قم بإيقاف جميع المؤقتات أولاً.');
            return;
        }

        // Set the input values to the current rates
        // أسعار PS4
        const dualRateInput = document.getElementById('dual-rate-input');
        const tripleRateInput = document.getElementById('triple-rate-input');
        const quadRateInput = document.getElementById('quad-rate-input');

        // أسعار PS5
        const ps5DualRateInput = document.getElementById('ps5-dual-rate-input');
        const ps5TripleRateInput = document.getElementById('ps5-triple-rate-input');
        const ps5QuadRateInput = document.getElementById('ps5-quad-rate-input');

        // تعبئة أسعار PS4
        dualRateInput.value = hourlyRate ? hourlyRate.toString() : '';
        tripleRateInput.value = tripleHourlyRate ? tripleHourlyRate.toString() : '';
        quadRateInput.value = quadHourlyRate ? quadHourlyRate.toString() : '';
        
        // تعبئة أسعار PS5
        ps5DualRateInput.value = ps5HourlyRate ? ps5HourlyRate.toString() : '';
        ps5TripleRateInput.value = ps5TripleHourlyRate ? ps5TripleHourlyRate.toString() : '';
        ps5QuadRateInput.value = ps5QuadHourlyRate ? ps5QuadHourlyRate.toString() : '';

        // Focus on the dual rate input field
        setTimeout(() => {
            dualRateInput.focus();
        }, 100);

        updateRateUI(false); // Show input area, hide display
        deactivateScreens(); // Disable screen buttons while editing rate
        warningMessage.classList.remove('visible'); // Don't show warning during edit
        screensContainer.classList.add('visible'); // Keep container visible

        console.log('Edit rate button clicked, dualRate:', hourlyRate, 'tripleRate:', tripleHourlyRate, 'quadRate:', quadHourlyRate);
    }



    // --- Screen Activation/Deactivation ---
    function activateScreens() {
        screensContainer.querySelectorAll('.start-btn').forEach(btn => btn.disabled = false);
        screensContainer.querySelectorAll('.timer-btn').forEach(btn => btn.disabled = false);
        screensContainer.querySelectorAll('.drinks-btn').forEach(btn => btn.disabled = false);
        screensContainer.querySelectorAll('.hookah-btn').forEach(btn => btn.disabled = false);
        screensContainer.querySelectorAll('.previous-bill-btn').forEach(btn => btn.disabled = false);
    }

    function deactivateScreens() {
         screensContainer.querySelectorAll('.start-btn, .stop-btn, .reset-card-btn, .timer-btn, .drinks-btn, .hookah-btn, .previous-bill-btn').forEach(btn => btn.disabled = true);
         // Reset any active state visual cues if rate is removed
         screensContainer.querySelectorAll('.screen-card.active').forEach(card => card.classList.remove('active'));
    }


    // --- Screen Timer Logic ---
    function handleScreenButtonClick(event) {
        const button = event.target.closest('button');
        const tripleToggle = event.target.closest('.triple-toggle');
        const quadToggle = event.target.closest('.quad-toggle');
        const paymentStatusIndicator = event.target.closest('.payment-status');

        if (!button && !tripleToggle && !quadToggle && !paymentStatusIndicator) return; // Clicked outside a button or toggle

        const card = button ? button.closest('.screen-card') :
                    (tripleToggle ? tripleToggle.closest('.screen-card') :
                    (quadToggle ? quadToggle.closest('.screen-card') :
                    (paymentStatusIndicator ? paymentStatusIndicator.closest('.screen-card') : null)));
        if (!card) return; // Should not happen if button is inside a card

        const screenId = card.dataset.screenId;

        // Handle payment status indicator click
        if (paymentStatusIndicator) {
            togglePaymentStatus(paymentStatusIndicator, screenId);
            return;
        }

        // Handle triple toggle click
        if (tripleToggle) {
            toggleTripleMode(tripleToggle, card, screenId);
            return;
        }

        // Handle quad toggle click
        if (quadToggle) {
            toggleQuadMode(quadToggle, card, screenId);
            return;
        }

        if (button.classList.contains('start-btn')) {
            // Check if countdown timer is running
            if (countdownTimers[screenId] && countdownTimers[screenId].intervalId) {
                alert('لا يمكن بدء المؤقت العادي أثناء تشغيل المؤقت التنازلي');
                return;
            }
            startTimer(card, screenId);
        } else if (button.classList.contains('stop-btn')) {
            stopTimer(card, screenId);
        } else if (button.classList.contains('reset-card-btn')) {
            openConfirmResetModal(card, screenId);
        } else if (button.classList.contains('timer-btn')) {
            openTimerModal(card, screenId);
        } else if (button.classList.contains('drinks-btn')) {
            openDrinksModal(card, screenId);
        } else if (button.classList.contains('hookah-btn')) {
            openHookahModal(card, screenId);
        } else if (button.classList.contains('previous-bill-btn')) {
            openPreviousBillModal(card, screenId);
        }
    }

    // Function to toggle triple mode
    function toggleTripleMode(toggleElement, card, screenId) {
        // Check if there is an active timer
        if (screenTimers[screenId] && screenTimers[screenId].intervalId) {
            showNotification('لا يمكن تغيير الوضع أثناء تشغيل المؤقت', 'error');
            return;
        }

        // Check if there is an active countdown timer
        if (countdownTimers[screenId] && countdownTimers[screenId].intervalId) {
            showNotification('لا يمكن تغيير الوضع أثناء تشغيل المؤقت', 'error');
            return;
        }

        // Get quad toggle element
        const quadToggle = card.querySelector('.quad-toggle');

        // Change mode state
        const isTripleMode = toggleElement.classList.contains('active');

        if (isTripleMode) {
            // Change to dual mode
            toggleElement.classList.remove('active');
            card.classList.remove('triple-mode');
            screenModes[screenId] = "dual";
        } else {
            // Change to triple mode
            toggleElement.classList.add('active');
            card.classList.add('triple-mode');

            // Disable quad mode if active
            if (quadToggle.classList.contains('active')) {
                quadToggle.classList.remove('active');
                card.classList.remove('quad-mode');
            }

            screenModes[screenId] = "triple";
        }

        // Update any displayed cost if necessary
        if (card.querySelector('.cost-display').classList.contains('visible')) {
            const elapsedSeconds = screenTimers[screenId] ? screenTimers[screenId].elapsedSeconds : 0;
            calculateAndDisplayCost(card, elapsedSeconds);
        }
    }

    // Función para alternar el modo quad/dual/triple
    function toggleQuadMode(toggleElement, card, screenId) {
        // Verificar si hay un temporizador normal activo
        if (screenTimers[screenId] && screenTimers[screenId].intervalId) {
            showNotification('لا يمكن تغيير الوضع أثناء تشغيل المؤقت', 'error');
            return;
        }

        // Verificar si hay un temporizador de cuenta regresiva activo
        if (countdownTimers[screenId] && countdownTimers[screenId].intervalId) {
            showNotification('لا يمكن تغيير الوضع أثناء تشغيل المؤقت', 'error');
            return;
        }

        // Get triple toggle element
        const tripleToggle = card.querySelector('.triple-toggle');

        // Cambiar el estado del modo
        const isQuadMode = toggleElement.classList.contains('active');

        if (isQuadMode) {
            // Cambiar a modo dual
            toggleElement.classList.remove('active');
            card.classList.remove('quad-mode');
            screenModes[screenId] = "dual";
        } else {
            // Cambiar a modo quad
            toggleElement.classList.add('active');
            card.classList.add('quad-mode');

            // Disable triple mode if active
            if (tripleToggle.classList.contains('active')) {
                tripleToggle.classList.remove('active');
                card.classList.remove('triple-mode');
            }

            screenModes[screenId] = "quad";
        }
    }

    // وظيفة لتبديل حالة الدفع
    function togglePaymentStatus(statusElement, screenId) {
        // تبديل حالة الدفع
        const isPaid = statusElement.classList.contains('paid');

        if (isPaid) {
            // تغيير إلى غير مدفوع
            statusElement.classList.remove('paid');
            statusElement.classList.add('unpaid');
            statusElement.innerHTML = '<i class="fas fa-times"></i>'; // أيقونة X
            statusElement.title = 'انقر لتغيير حالة الدفع (غير مدفوع)';
            paymentStatus[screenId] = false;
        } else {
            // تغيير إلى مدفوع
            statusElement.classList.remove('unpaid');
            statusElement.classList.add('paid');
            statusElement.innerHTML = '<i class="fas fa-check"></i>'; // أيقونة ✓
            statusElement.title = 'انقر لتغيير حالة الدفع (مدفوع)';
            paymentStatus[screenId] = true;
        }

        // حفظ حالة الدفع في localStorage
        savePaymentStatus();
    }

    function startTimer(card, screenId, savedStartTime = null, savedElapsedSeconds = 0) {
        if (!hourlyRate) {
            alert('الرجاء حفظ سعر الساعة أولاً.');
            return;
        }
        // Prevent starting if already running
        if (screenTimers[screenId] && screenTimers[screenId].intervalId) {
            return;
        }

        // تصفير تكاليف المشروبات والأراكيل وفواتير سابقة عند بدء مؤقت جديد
        // إلا إذا كان هذا استعادة لمؤقت محفوظ (في حالة savedStartTime)
        if (!savedStartTime) {
            drinksCosts[screenId] = [];
            hookahCosts[screenId] = [];
            // تصفير الفواتير السابقة
            if (window.previousBills && window.previousBills[screenId]) {
                window.previousBills[screenId] = [];
            }
        } else {
            // إذا كان هذا استعادة لمؤقت محفوظ، نقوم بتحديث عرض أرقام المشروبات والأراكيل والفواتير السابقة
            updateDrinksValues(screenId);
            updateHookahValues(screenId);
            updatePreviousBillValues(screenId);
        }

        const timeDisplay = card.querySelector('.time-display');
        const costDisplay = card.querySelector('.cost-display');
        const startBtn = card.querySelector('.start-btn');
        const stopBtn = card.querySelector('.stop-btn');
        const resetBtn = card.querySelector('.reset-card-btn');

        // Reset previous state if any
        timeDisplay.textContent = '00:00:00';
        costDisplay.textContent = '';
        costDisplay.classList.remove('visible');
        card.classList.add('active'); // Add active class for styling

        // استخدام وقت البدء المحفوظ إذا كان موجودًا، وإلا استخدام الوقت الحالي
        const startTime = savedStartTime ? new Date(savedStartTime).getTime() : Date.now();

        screenTimers[screenId] = {
            startTime: startTime,
            intervalId: null,
            elapsedSeconds: savedElapsedSeconds || 0
        };

        // تحديث العرض فورًا بالوقت المنقضي المحفوظ إذا كان موجودًا
        updateTimeDisplay(timeDisplay, screenTimers[screenId].elapsedSeconds);

        // Start the interval
        screenTimers[screenId].intervalId = setInterval(() => {
            const now = Date.now();
            let elapsedSeconds;

            if (savedStartTime) {
                // إذا كان هناك وقت بدء محفوظ، نحسب الوقت المنقضي من الوقت الحالي - وقت البدء + الثواني المنقضية المحفوظة
                elapsedSeconds = Math.floor((now - startTime) / 1000) + savedElapsedSeconds;
            } else {
                // حساب الوقت المنقضي بشكل عادي
                elapsedSeconds = Math.floor((now - startTime) / 1000);
            }

            screenTimers[screenId].elapsedSeconds = elapsedSeconds;
            updateTimeDisplay(timeDisplay, elapsedSeconds);
        }, 1000); // Update every second

        // Update button states
        startBtn.disabled = true;
        stopBtn.disabled = false;
        resetBtn.disabled = false;
        card.querySelector('.timer-btn').disabled = true; // Disable timer button while counting
        card.querySelector('.drinks-btn').disabled = false; // Keep drinks button enabled
        card.querySelector('.hookah-btn').disabled = false; // Keep hookah button enabled
        card.querySelector('.previous-bill-btn').disabled = false; // Keep previous bill button enabled
    }

    // دالة لاستعادة المؤقت التنازلي
    function restoreCountdownTimer(card, screenId, timerData) {
        if (!hourlyRate) {
            return;
        }

        // التأكد من عدم وجود مؤقت نشط لهذه الشاشة
        if (countdownTimers[screenId] && countdownTimers[screenId].intervalId) {
            clearInterval(countdownTimers[screenId].intervalId);

            // إزالة عرض العد التنازلي إذا كان موجودًا
            if (countdownTimers[screenId].display && countdownTimers[screenId].display.parentNode) {
                countdownTimers[screenId].display.remove();
            }
        }

        // إنشاء عرض العد التنازلي
        const countdownDisplay = document.createElement('div');
        countdownDisplay.classList.add('countdown-display');
        card.appendChild(countdownDisplay);

        // تحديث واجهة المستخدم لهذه الشاشة فقط
        card.classList.add('active');
        card.querySelector('.start-btn').disabled = true;
        card.querySelector('.stop-btn').disabled = true;
        card.querySelector('.reset-card-btn').disabled = false;
        card.querySelector('.timer-btn').disabled = true;
        card.querySelector('.drinks-btn').disabled = false;
        card.querySelector('.hookah-btn').disabled = false;
        card.querySelector('.previous-bill-btn').disabled = false;

        // تحديث عرض أرقام المشروبات والأراكيل
        updateDrinksValues(screenId);
        updateHookahValues(screenId);

        // إنشاء مؤقت العد التنازلي
        countdownTimers[screenId] = {
            intervalId: null,
            endTime: timerData.endTime,
            totalSeconds: timerData.totalSeconds,
            display: countdownDisplay,
            inputCost: timerData.inputCost
        };

        // تحديث العد التنازلي فورًا
        updateCountdown(screenId, countdownDisplay);

        // بدء الفاصل الزمني لهذه الشاشة
        countdownTimers[screenId].intervalId = setInterval(() => {
            // التحقق من وجود مؤقت العد التنازلي
            if (!countdownTimers[screenId]) {
                clearInterval(countdownTimers[screenId].intervalId);
                return;
            }

            if (!updateCountdown(screenId, countdownDisplay)) {
                // انتهى الوقت
                clearInterval(countdownTimers[screenId].intervalId);

                // إزالة عرض العد التنازلي إذا كان لا يزال موجودًا
                if (countdownDisplay.parentNode) {
                    countdownDisplay.remove();
                }

                // تحديث بيانات المؤقت
                countdownTimers[screenId].intervalId = null;

                // إظهار جملة تذكير بالتكلفة
                const costDisplay = card.querySelector('.cost-display');

                // تحديد المبلغ المدخل أو حسابه من الدقائق
                let cost = 0;

                try {
                    // الحصول على بيانات المؤقت
                    if (countdownTimers[screenId]) {
                        // التحقق من وجود مبلغ مدخل مسبقاً
                        if (countdownTimers[screenId].inputCost !== null) {
                            // استخدام المبلغ المدخل مسبقاً
                            cost = countdownTimers[screenId].inputCost;
                        } else if (countdownTimers[screenId].totalSeconds) {
                            // تحديد نوع الشاشة (PS4 أو PS5)
                            const screenType = screenTypes[screenId] || "ps4";
                            
                            // تحديد ما إذا كانت الشاشة في وضع رباعي أو ثلاثي أو ثنائي
                            const screenMode = screenModes[screenId] || "dual";

                            // استخدام السعر المناسب حسب الوضع
                            let rate;
                            
                            if (screenType === "ps5") {
                                // استخدام أسعار PS5
                                if (screenMode === "quad") {
                                    rate = ps5QuadHourlyRate;
                                } else if (screenMode === "triple") {
                                    rate = ps5TripleHourlyRate;
                                } else {
                                    rate = ps5HourlyRate;
                                }
                            } else {
                                // استخدام أسعار PS4
                            if (screenMode === "quad") {
                                rate = quadHourlyRate;
                            } else if (screenMode === "triple") {
                                rate = tripleHourlyRate;
                            } else {
                                rate = hourlyRate;
                                }
                            }

                            // حساب التكلفة من الدقائق
                            const minutes = countdownTimers[screenId].totalSeconds / 60;
                            cost = Math.ceil((rate * minutes) / 60);
                        } else {
                            // في حالة عدم وجود بيانات المؤقت
                            cost = 100; // قيمة افتراضية
                        }
                    } else {
                        cost = 100; // قيمة افتراضية
                    }
                } catch (error) {
                    console.error('خطأ في حساب التكلفة:', error);
                    cost = 100; // قيمة افتراضية في حالة الخطأ
                }

                // تطبيق التقريب الجديد على التكلفة
                const roundedCost = roundCost(cost);

                // الحصول على تكاليف المشروبات
                const drinks = drinksCosts[screenId] || [];
                const totalDrinksCost = drinks.reduce((sum, cost) => sum + cost, 0);

                // الحصول على تكاليف الأراكيل
                const hookahs = hookahCosts[screenId] || [];
                const totalHookahCost = hookahs.reduce((sum, cost) => sum + cost, 0);

                // حساب المجموع
                const totalCost = roundedCost + totalDrinksCost + totalHookahCost;

                // إنشاء كائن معاملة مخصص بوقت البدء والانتهاء
                const transaction = {
                    id: Date.now().toString(),
                    screenNumber: screenId,
                    type: 'screen',
                    cost: roundedCost,
                    time: new Date().toISOString(),
                    endTime: new Date().toISOString(),
                    startTime: new Date(countdownTimers[screenId].endTime - (countdownTimers[screenId].totalSeconds * 1000)).toISOString(),
                    duration: Math.round(countdownTimers[screenId].totalSeconds / 60), // بالدقائق
                    screenMode: screenModes[screenId] || "dual",
                    screenType: screenTypes[screenId] || "ps4"
                };

                // الحصول على التاريخ المعدل (اليوم ينتهي في الساعة 6 صباحًا)
                const currentDate = getAdjustedDate();
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                const day = currentDate.getDate();
                
                // الحصول على المعاملات الحالية
                const transactions = getTransactions(year, month, day);
                
                // إضافة المعاملة الجديدة
                transactions.push(transaction);
                
                // حفظ المعاملات المحدثة
                const dayStorageKey = getDayTransactionsStorageKey(year, month, day);
                localStorage.setItem(dayStorageKey, JSON.stringify(transactions));

                // Calculate and display cost
                calculateAndDisplayCost(card, finalElapsedSeconds);

                // Update button states
                card.querySelector('.start-btn').disabled = false;
                card.querySelector('.stop-btn').disabled = true;
                // Keep reset enabled after stopping
                card.querySelector('.reset-card-btn').disabled = false;
                // Re-enable timer button
                card.querySelector('.timer-btn').disabled = false;
                // Keep drinks button enabled
                card.querySelector('.drinks-btn').disabled = false;
                // Keep hookah button enabled
                card.querySelector('.hookah-btn').disabled = false;
                // Keep previous bill button enabled
                card.querySelector('.previous-bill-btn').disabled = false;

                // إخفاء أرقام المشروبات والأراكيل
                const drinksValues = card.querySelector('.drinks-values');
                const hookahValues = card.querySelector('.hookah-values');
                drinksValues.textContent = '';
                hookahValues.textContent = '';

                card.classList.remove('active'); // Remove active class
                
                // تحديث الأرباح الشهرية فوراً
                forceUpdateMonthlyProfits();
            }
        }, 1000);
    }

    function stopTimer(card, screenId) {
        const timerData = screenTimers[screenId];
        if (!timerData || !timerData.intervalId) return; // Timer not running

        clearInterval(timerData.intervalId);
        timerData.intervalId = null; // Mark as stopped

         // Recalculate final elapsed time accurately
        const finalElapsedSeconds = Math.floor((Date.now() - timerData.startTime) / 1000);
        timerData.elapsedSeconds = finalElapsedSeconds; // Store final elapsed time

        // تحديد نوع الشاشة (PS4 أو PS5)
        const screenType = screenTypes[screenId] || "ps4";

        // تحديد ما إذا كانت الشاشة في وضع رباعي أو ثلاثي أو ثنائي
        const screenMode = screenModes[screenId] || "dual";

        // استخدام السعر المناسب حسب الوضع
        let rate;
        
        if (screenType === "ps5") {
            // استخدام أسعار PS5
            if (screenMode === "quad") {
                rate = ps5QuadHourlyRate;
            } else if (screenMode === "triple") {
                rate = ps5TripleHourlyRate;
            } else {
                rate = ps5HourlyRate;
            }
        } else {
            // استخدام أسعار PS4
            if (screenMode === "quad") {
                rate = quadHourlyRate;
            } else if (screenMode === "triple") {
                rate = tripleHourlyRate;
            } else {
                rate = hourlyRate;
            }
        }

        // حساب التكلفة الأولية
        const cost = (rate * finalElapsedSeconds) / 3600;

        // تطبيق التقريب
        const roundedCost = roundCost(cost);

        // إنشاء كائن معاملة مخصص بوقت البدء والانتهاء
        const transaction = {
            id: Date.now().toString(),
            screenNumber: screenId,
            type: 'screen',
            cost: roundedCost,
            time: new Date().toISOString(),
            endTime: new Date().toISOString(),
            startTime: new Date(timerData.startTime).toISOString(),
            duration: Math.ceil(finalElapsedSeconds / 60), // بالدقائق
            screenMode: screenMode,
            screenType: screenType
        };

        // الحصول على التاريخ المعدل (اليوم ينتهي في الساعة 6 صباحًا)
        const currentDate = getAdjustedDate();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();
        
        // الحصول على المعاملات الحالية
        const transactions = getTransactions(year, month, day);
        
        // إضافة المعاملة الجديدة
        transactions.push(transaction);
        
        // حفظ المعاملات المحدثة
        const dayStorageKey = getDayTransactionsStorageKey(year, month, day);
        localStorage.setItem(dayStorageKey, JSON.stringify(transactions));

        // Calculate and display cost
        calculateAndDisplayCost(card, finalElapsedSeconds);

        // Update button states
        card.querySelector('.start-btn').disabled = false;
        card.querySelector('.stop-btn').disabled = true;
        // Keep reset enabled after stopping
        card.querySelector('.reset-card-btn').disabled = false;
        // Re-enable timer button
        card.querySelector('.timer-btn').disabled = false;
        // Keep drinks button enabled
        card.querySelector('.drinks-btn').disabled = false;
        // Keep hookah button enabled
        card.querySelector('.hookah-btn').disabled = false;
        // Keep previous bill button enabled
        card.querySelector('.previous-bill-btn').disabled = false;

        // إخفاء أرقام المشروبات والأراكيل والفواتير السابقة
        const drinksValues = card.querySelector('.drinks-values');
        const hookahValues = card.querySelector('.hookah-values');
        const previousBillValues = card.querySelector('.previous-bill-values');
        drinksValues.textContent = '';
        hookahValues.textContent = '';
        previousBillValues.textContent = '';

        card.classList.remove('active'); // Remove active class
        
        // تحديث الأرباح الشهرية فوراً
        forceUpdateMonthlyProfits();
    }

    function resetCard(card, screenId) {
        // Stop timer if running
        if (screenTimers[screenId] && screenTimers[screenId].intervalId) {
            clearInterval(screenTimers[screenId].intervalId);
        }

        // Stop countdown timer if running
        if (countdownTimers[screenId] && countdownTimers[screenId].intervalId) {
            clearInterval(countdownTimers[screenId].intervalId);

            // Remove countdown display if exists
            if (countdownTimers[screenId].display) {
                countdownTimers[screenId].display.remove();
            }

            delete countdownTimers[screenId];
        }

        // Clear timer data
        delete screenTimers[screenId];

        // Clear drinks costs
        if (drinksCosts[screenId]) {
            delete drinksCosts[screenId];
        }

        // Clear hookah costs
        if (hookahCosts[screenId]) {
            delete hookahCosts[screenId];
        }
        
        // Clear previous bills
        if (window.previousBills && window.previousBills[screenId]) {
            delete window.previousBills[screenId];
        }

        // Reset UI elements
        card.querySelector('.time-display').textContent = '00:00:00';
        const costDisplay = card.querySelector('.cost-display');
        costDisplay.textContent = '';
        costDisplay.classList.remove('visible');
        card.classList.remove('active');

        // إخفاء أرقام المشروبات والأراكيل والفواتير السابقة
        const drinksValues = card.querySelector('.drinks-values');
        const hookahValues = card.querySelector('.hookah-values');
        const previousBillValues = card.querySelector('.previous-bill-values');
        drinksValues.textContent = '';
        hookahValues.textContent = '';
        previousBillValues.textContent = '';

        // Reset button states
        card.querySelector('.start-btn').disabled = !hourlyRate; // Enable only if rate is set
        card.querySelector('.stop-btn').disabled = true;
        card.querySelector('.reset-card-btn').disabled = true;
        card.querySelector('.timer-btn').disabled = !hourlyRate; // Enable timer button only if rate is set
        card.querySelector('.drinks-btn').disabled = !hourlyRate; // Enable drinks button only if rate is set
        card.querySelector('.hookah-btn').disabled = !hourlyRate; // Enable hookah button only if rate is set
        card.querySelector('.previous-bill-btn').disabled = !hourlyRate; // Enable previous bill button only if rate is set

        // إعادة ضبط حالة الدفع إلى "غير مدفوع"
        paymentStatus[screenId] = false;

        // تحديث مؤشر حالة الدفع
        const paymentStatusIndicator = card.querySelector('.payment-status');
        if (paymentStatusIndicator) {
            paymentStatusIndicator.classList.remove('paid');
            paymentStatusIndicator.classList.add('unpaid');
            paymentStatusIndicator.innerHTML = '<i class="fas fa-times"></i>';
            paymentStatusIndicator.title = 'انقر لتغيير حالة الدفع (غير مدفوع)';
        }

        // حفظ حالة الدفع
        savePaymentStatus();
        
        // تحديث الأرباح الشهرية فوراً
        forceUpdateMonthlyProfits();
    }

    // --- Helper Functions ---
    function updateTimeDisplay(element, totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        element.textContent =
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Function to update Damascus time
    function updateDamascusTime() {
        // Create a new date object with the current time
        const now = new Date();

        // Get hours in 24-hour format
        let hours24 = now.getHours();

        // Convert to 12-hour format
        let hours12 = hours24 % 12;

        // Handle 0 hour (12 AM) case
        if (hours12 === 0) {
            hours12 = 12;
        }

        // Determine if it's AM or PM
        const period = hours24 < 12 ? 'ص' : 'م';

        // Format the time as HH:MM:SS
        const hours = String(hours12).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        // Update the Damascus time element
        damascusTimeElement.textContent = `${hours}:${minutes}:${seconds} ${period}`;
    }

    // Function to update active screens count
    function updateActiveScreensCount() {
        // Count active timers (both regular and countdown)
        let activeCount = 0;

        // Count regular timers
        for (const screenId in screenTimers) {
            if (screenTimers[screenId] && screenTimers[screenId].intervalId) {
                activeCount++;
            }
        }

        // Count countdown timers
        for (const screenId in countdownTimers) {
            if (countdownTimers[screenId] && countdownTimers[screenId].intervalId) {
                activeCount++;
            }
        }

        // Update the active screens count element
        activeScreensCountElement.textContent = activeCount;
    }

    // وظيفة لتقريب التكلفة حسب المتطلبات الجديدة
    function roundCost(cost) {
        // تحويل التكلفة إلى رقم صحيح للتأكد
        cost = Math.ceil(cost);

        if (cost < 1000) {
            // تقريب للأعلى إلى أقرب 100
            return Math.ceil(cost / 100) * 100;
        } else {
            // تقريب للأعلى إلى أقرب 500
            return Math.ceil(cost / 500) * 500;
        }
    }

    function calculateAndDisplayCost(card, elapsedSeconds) {
        if (!hourlyRate) return;

        // Get the screen ID
        const screenId = card.dataset.screenId;
        
        // تحديد نوع الشاشة (PS4 أو PS5)
        const screenType = screenTypes[screenId] || "ps4";

        // Determinar si la pantalla está en modo triple, quad o dual
        const screenMode = screenModes[screenId] || "dual";

        // Usar la tarifa correspondiente según el modo y el tipo de pantalla
        let rate;
        
        if (screenType === "ps5") {
            // استخدام أسعار PS5
            if (screenMode === "quad") {
                rate = ps5QuadHourlyRate;
            } else if (screenMode === "triple") {
                rate = ps5TripleHourlyRate;
            } else {
                rate = ps5HourlyRate;
            }
        } else {
            // استخدام أسعار PS4
        if (screenMode === "quad") {
            rate = quadHourlyRate;
        } else if (screenMode === "triple") {
            rate = tripleHourlyRate;
        } else {
            rate = hourlyRate;
            }
        }

        // Calcular el costo inicial
        const cost = (rate * elapsedSeconds) / 3600;

        // Aplicar el redondeo
        const roundedCost = roundCost(cost);

        // Get drinks costs
        const drinks = drinksCosts[screenId] || [];
        const totalDrinksCost = drinks.reduce((sum, cost) => sum + cost, 0);

        // Get hookah costs
        const hookahs = hookahCosts[screenId] || [];
        const totalHookahCost = hookahs.reduce((sum, cost) => sum + cost, 0);

        // Calculate total
        const totalCost = roundedCost + totalDrinksCost + totalHookahCost;

        // Update display
        const costDisplay = card.querySelector('.cost-display');

        // Format the display with screen cost, drinks costs, hookah costs, and total
        let displayText = `<div class="cost-item"><span>تكلفة الوقت</span><span>${roundedCost} ل.س</span></div>`;
        let hasExtras = false;

        if (totalDrinksCost > 0) {
            displayText += `<div class="cost-item"><span>مشروبات</span><span>${totalDrinksCost} ل.س</span></div>`;
            hasExtras = true;
        }

        if (totalHookahCost > 0) {
            displayText += `<div class="cost-item"><span>أراكيل</span><span>${totalHookahCost} ل.س</span></div>`;
            hasExtras = true;
        }

        // إضافة الفواتير السابقة إذا وجدت
        let previousBillsCost = 0;
        
        if (window.previousBills && window.previousBills[screenId] && window.previousBills[screenId].length > 0) {
            const bills = window.previousBills[screenId];
            for (const bill of bills) {
                displayText += `<div class="cost-item"><span>فاتورة سابقة</span><span>${bill.cost} ل.س</span></div>`;
                previousBillsCost += bill.cost;
                hasExtras = true;
            }
            // مسح مصفوفة الفواتير بعد إضافتها للتكلفة
            window.previousBills[screenId] = [];
        }

        // حساب المجموع النهائي مع الفواتير السابقة
        const finalTotal = totalCost + previousBillsCost;

        // Check if we have any extras (drinks, hookahs, previous bills)
        if (totalDrinksCost > 0 || totalHookahCost > 0 || previousBillsCost > 0) {
            hasExtras = true;
        }

        if (hasExtras) {
            displayText += `<div class="cost-total"><span>المجموع</span><span>${finalTotal} ل.س</span></div>`;
        } else {
            // إذا لم تكن هناك مشروبات أو أراكيل أو فواتير سابقة، نعرض تكلفة الوقت والمجموع
            displayText = `<div class="cost-item"><span>تكلفة الوقت</span><span>${roundedCost} ل.س</span></div>`;
            displayText += `<div class="cost-total"><span>المجموع</span><span>${roundedCost} ل.س</span></div>`;
        }

        // إظهار التكلفة
        costDisplay.innerHTML = displayText;
        costDisplay.classList.add('visible');

        // إخفاء أرقام المشروبات والأراكيل تحت الأزرار بعد عرض التكلفة النهائية
        const drinksValues = card.querySelector('.drinks-values');
        const hookahValues = card.querySelector('.hookah-values');
        const previousBillValues = card.querySelector('.previous-bill-values');
        drinksValues.textContent = '';
        hookahValues.textContent = '';
        previousBillValues.textContent = '';

        // Reset card
        // لا نستدعي resetCard لأننا نريد إبقاء جملة التذكير ظاهرة
        // نقوم فقط بإعادة ضبط حالة الأزرار
        card.classList.remove('active');
        card.querySelector('.start-btn').disabled = !hourlyRate;
        card.querySelector('.stop-btn').disabled = true;
        card.querySelector('.reset-card-btn').disabled = false;
        card.querySelector('.timer-btn').disabled = !hourlyRate;
        card.querySelector('.drinks-btn').disabled = !hourlyRate;
        card.querySelector('.hookah-btn').disabled = !hourlyRate;
        card.querySelector('.previous-bill-btn').disabled = !hourlyRate;

        // إزالة الإشعار
        // Show notification with the screen number
        // const screenNumber = card.querySelector('h3').textContent.match(/\d+/)[0];
        // showNotification(`تم إيقاف الشاشة ${screenNumber} - التكلفة: ${roundedCost} ل.س`);

        // تحديث الأرباح الشهرية فوراً
        forceUpdateMonthlyProfits();
    }

    function updateCountdown(screenId, displayElement) {
        const timerData = countdownTimers[screenId];
        if (!timerData || !timerData.endTime) return false;

        const now = Date.now();
        const remaining = timerData.endTime - now;

        if (remaining <= 0) {
            displayElement.textContent = '00:00';
            return false; // Time's up
        }

        const remainingSeconds = Math.ceil(remaining / 1000);
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;

        displayElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        return true; // Still counting
    }

    // --- Confirm Reset Modal Functions ---
    // هذه المتغيرات تستخدم لتخزين بيانات الشاشة التي سيتم إعادة ضبطها
    // عند الضغط على زر "نعم، إعادة الضبط" سيتم استخدام هذه البيانات لإعادة ضبط الشاشة المحددة
    let pendingResetCard = null;
    let pendingResetScreenId = null;

    function openConfirmResetModal(card, screenId) {
        // Store the card and screenId for later use
        pendingResetCard = card;
        pendingResetScreenId = screenId;

        // Show the modal
        confirmResetOverlay.classList.add('active');
    }

    function closeConfirmResetModal() {
        // إزالة الصنف 'active' لإخفاء المودال
        confirmResetOverlay.classList.remove('active');

        // Clear pending reset data
        pendingResetCard = null;
        pendingResetScreenId = null;

        console.log('Modal closed'); // للتأكد من أن الدالة تعمل بشكل صحيح
    }

    function handleConfirmReset() {
        if (pendingResetCard && pendingResetScreenId) {
            // إعادة ضبط الشاشة المحددة
            resetCard(pendingResetCard, pendingResetScreenId);
            // إغلاق مودال التأكيد بعد إعادة الضبط
            closeConfirmResetModal();
        }
    }

    // --- Confirm Reset All Modal Functions ---
    function openConfirmResetAllModal() {
        // Check if any screens have data to reset (active timers, costs, or countdown timers)
        if (!hasScreensToReset()) {
            showNotification('لا توجد شاشات تحتاج إلى إعادة ضبط.');
            return;
        }

        // Show the modal
        confirmResetAllOverlay.classList.add('active');
    }

    // Check if any screens have data to reset
    function hasScreensToReset() {
        // Check for active timers
        if (hasActiveTimers()) {
            return true;
        }

        // Check for screens with costs displayed
        const screensWithCosts = screensContainer.querySelectorAll('.cost-display.visible');
        if (screensWithCosts.length > 0) {
            return true;
        }

        // Check for screens with stored drinks costs
        if (Object.keys(drinksCosts).length > 0) {
            return true;
        }

        // Check for screens with stored hookah costs
        if (Object.keys(hookahCosts).length > 0) {
            return true;
        }

        // Check for screens with non-zero time display
        const screens = screensContainer.querySelectorAll('.screen-card');
        for (const screen of screens) {
            const timeDisplay = screen.querySelector('.time-display').textContent;
            if (timeDisplay !== '00:00:00') {
                return true;
            }
        }

        return false;
    }

    function closeConfirmResetAllModal() {
        // Hide the modal
        confirmResetAllOverlay.classList.remove('active');
    }

    function resetAllScreens() {
        // Get all screen cards
        const screenCards = screensContainer.querySelectorAll('.screen-card');

        // Reset each screen
        screenCards.forEach(card => {
            const screenId = card.dataset.screenId;
            resetCard(card, screenId);
        });

        // Show notification
        showNotification('تم إعادة ضبط جميع الشاشات بنجاح.');

        // Close the modal
        closeConfirmResetAllModal();
        
        // تحديث الأرباح الشهرية فوراً
        forceUpdateMonthlyProfits();
    }

    // --- Notification Functions ---
    function showNotification(message, type = 'info') {
        // Play notification sound for all notifications
        try {
            console.log('Attempting to play notification sound...');
            
            // Try direct sound playing using the global function
            if (typeof window.playNotificationSound === 'function') {
                window.playNotificationSound();
            }
            
            // Additional approach for timer end notifications
            if (message.includes('انتهى وقت الشاشة')) {
                console.log('Timer ended notification - ensuring sound plays');
                
                // Try to use the embedded audio element directly
                const notificationSound = document.getElementById('notification-sound');
                if (notificationSound) {
                    notificationSound.currentTime = 0;
                    notificationSound.volume = 1.0;
                    
                    // Force play the sound with a slight delay
                    setTimeout(() => {
                        const playPromise = notificationSound.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(error => {
                                console.error('Could not play embedded sound:', error);
                                
                                // Use Audio API as last resort
                                const audio = new Audio('sounds/noti.mp3');
                                audio.volume = 1.0;
                                audio.play().catch(e => console.error('Last resort sound failed:', e));
                            });
                        }
                    }, 50);
                }
            }
        } catch (e) {
            console.error('Error playing notification sound:', e);
        }

        // Check if this is a screen timer notification
        let screenNumber = null;
        if (message.includes('انتهى وقت الشاشة')) {
            // Extract screen number from the message
            const screenText = message.match(/الشاشة (\d+)/)[0];
            screenNumber = screenText.match(/(\d+)/)[0];

            // Check if there's already a notification for this screen
            const existingNotification = Array.from(notificationsContainer.querySelectorAll('.notification'))
                .find(notif => {
                    const content = notif.querySelector('.message').innerHTML;
                    return content.includes(`الشاشة <span class="screen-number">${screenNumber}</span>`);
                });

            // If there's already a notification for this screen, remove it
            if (existingNotification) {
                existingNotification.classList.remove('active');
                setTimeout(() => existingNotification.remove(), 300);
            }
        }

        // Create a new notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = 'message';

        // Format the message to highlight the screen number
        if (screenNumber) {
            // Replace the message format to highlight the screen number
            const formattedMessage = message
                .replace(`الشاشة ${screenNumber}`, `الشاشة <span class="screen-number">${screenNumber}</span>`);

            messageElement.innerHTML = formattedMessage;

            // Add a data attribute to identify the screen number
            notification.dataset.screenNumber = screenNumber;
        } else {
            messageElement.textContent = message;
        }

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'close';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => {
            notification.classList.remove('active');
            // Remove notification after animation completes
            setTimeout(() => notification.remove(), 300);
        });

        // Append elements to notification
        notification.appendChild(messageElement);
        notification.appendChild(closeButton);

        // Add notification to container
        notificationsContainer.appendChild(notification);

        // Trigger animation after a small delay (for proper rendering)
        setTimeout(() => notification.classList.add('active'), 10);
    }

     // Function to add ripple effect to elements
    function addRippleEffect(selector) {
         document.querySelectorAll(selector).forEach(button => {
            button.addEventListener('click', function (e) {
                 // Clear previous ripples
                 const oldRipple = button.querySelector('.ripple');
                 if(oldRipple) oldRipple.remove();

                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;

                this.appendChild(ripple);

                // Clean up ripple element afterwards
                ripple.addEventListener('animationend', () => {
                    ripple.remove();
                });
            });
        });
    }


    // إعداد مستمعات الأحداث لمودال مسح البيانات
    function setupClearDataModalListeners() {
        // لا نحتاج لإضافة مستمعات الأحداث هنا لأنها موجودة في ملف clear-data.js
        console.log('تم إعداد مستمعات الأحداث لمودال مسح البيانات');
    }

    // إعداد وظائف العرض الشهري واليومي
    function setupMonthlyView() {
        // الحصول على عناصر واجهة المستخدم
        const yearFilter = document.getElementById('filter-year');
        const monthFilter = document.getElementById('filter-month');
        const daysContainer = document.getElementById('days-container');
        const transactionsList = document.getElementById('transactions-list');

        // تعيين السنة الحالية والشهر الحالي (مع مراعاة أن اليوم ينتهي في الساعة 6 صباحًا)
        const adjustedDate = getAdjustedDate();
        const currentYear = adjustedDate.getFullYear();
        const currentMonth = adjustedDate.getMonth() + 1;

        // عرض السنة الحالية فقط بدون إمكانية الاختيار
        yearFilter.innerHTML = ''; // تفريغ القائمة
        const option = document.createElement('option');
        option.value = currentYear;
        option.textContent = currentYear;
        option.selected = true;
        yearFilter.appendChild(option);

        // تعطيل خيار السنة
        yearFilter.disabled = true;

        // تحديد الشهر الحالي في قائمة الشهور
        monthFilter.value = currentMonth;

        // إضافة مستمع الحدث للفلتر
        monthFilter.addEventListener('change', updateMonthlyView);

        // تحديث العرض الشهري تلقائيًا عند تغير السنة
        // سيتم تنفيذ هذا الكود عند بداية كل سنة جديدة
        setInterval(() => {
            const newYear = getAdjustedDate().getFullYear();
            if (newYear !== parseInt(yearFilter.value)) {
                // تحديث السنة
                yearFilter.innerHTML = '';
                const newOption = document.createElement('option');
                newOption.value = newYear;
                newOption.textContent = newYear;
                newOption.selected = true;
                yearFilter.appendChild(newOption);

                // تحديث العرض الشهري
                updateMonthlyView();
            }
        }, 3600000); // التحقق كل ساعة

        // تحديث العرض الشهري عند التحميل
        updateMonthlyView();

        // دالة لتحديث العرض الشهري
        function updateMonthlyView() {
            const selectedYear = parseInt(yearFilter.value);
            const selectedMonth = parseInt(monthFilter.value);

            // تحديث عرض أيام الشهر
            updateDaysView(selectedYear, selectedMonth);

            // تحديث الإجمالي الشهري
            updateMonthlySummary(selectedYear, selectedMonth);
        }
        
        // جعل الدالة متاحة عالميا
        window.updateMonthlyView = updateMonthlyView;

        // دالة لتحديث عرض أيام الشهر
        function updateDaysView(year, month) {
            // تفريغ حاوية الأيام
            daysContainer.innerHTML = '';

            // الحصول على عدد أيام الشهر المحدد
            const daysInMonth = new Date(year, month, 0).getDate();

            // الحصول على اليوم الحالي (إذا كان الشهر والسنة هما الحاليين) مع مراعاة أن اليوم ينتهي في الساعة 6 صباحًا
        const currentDate = getAdjustedDate();
            const isCurrentMonth = (year === currentDate.getFullYear() && month === currentDate.getMonth() + 1);
            const currentDay = isCurrentMonth ? currentDate.getDate() : -1;

            // إنشاء عنصر لكل يوم في الشهر
            for (let day = 1; day <= daysInMonth; day++) {
                // إنشاء عنصر اليوم
                const dayItem = document.createElement('div');
                dayItem.className = 'day-item';
                if (day === currentDay) {
                    dayItem.classList.add('active');
                }

                // الحصول على اسم اليوم
                const date = new Date(year, month - 1, day);
                const dayName = getDayName(date.getDay());

                // التحقق مما إذا كان هناك بيانات لهذا اليوم
                const dayStorageKey = getDayTransactionsStorageKey(year, month, day);
                const hasDayData = localStorage.getItem(dayStorageKey) !== null;

                // إنشاء محتوى عنصر اليوم
                dayItem.innerHTML = `
                    <div class="day-number">${day}</div>
                    <div class="day-name">${dayName}</div>
                    ${hasDayData ? '<div class="day-has-data"></div>' : ''}
                `;

                // إضافة مستمع حدث للنقر على اليوم
                dayItem.addEventListener('click', function() {
                    // إزالة الصنف 'active' من جميع أيام الشهر
                    document.querySelectorAll('.day-item').forEach(item => {
                        item.classList.remove('active');
                    });

                    // إضافة الصنف 'active' لليوم المحدد
                    dayItem.classList.add('active');

                    // تحديث قائمة المعاملات لليوم المحدد
                    updateDayTransactions(year, month, day);
                });

                // إضافة عنصر اليوم إلى حاوية الأيام
                daysContainer.appendChild(dayItem);
            }

            // تحديث قائمة المعاملات لليوم الحالي (إذا كان الشهر والسنة هما الحاليين)
            if (isCurrentMonth) {
                updateDayTransactions(year, month, currentDay);
            } else {
                // تحديث قائمة المعاملات لليوم الأول من الشهر
                updateDayTransactions(year, month, 1);
            }
        }
        
        // جعل الدالة متاحة عالميا
        window.updateDaysView = updateDaysView;

        // دالة للحصول على اسم اليوم
        function getDayName(dayIndex) {
            const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
            return dayNames[dayIndex];
        }

        // دالة لتحديث قائمة المعاملات لليوم المحدد
        function updateDayTransactions(year, month, day) {
            // الحصول على المعاملات لليوم المحدد
            const transactions = getTransactions(year, month, day);

            // تفريغ قائمة المعاملات
            transactionsList.innerHTML = '';

            // حساب إجمالي اليوم
            let totalProfit = 0;
            let screensProfit = 0;
            let drinksProfit = 0;
            let hookahProfit = 0;
            let screenTransactionsCount = 0;

            // حساب الإجماليات
            transactions.forEach(transaction => {
                if (transaction.type === 'screen') {
                    screensProfit += transaction.cost;
                    screenTransactionsCount++;
                } else if (transaction.type === 'drinks') {
                    drinksProfit += transaction.cost;
                } else if (transaction.type === 'hookah') {
                    hookahProfit += transaction.cost;
                }
                totalProfit += transaction.cost;
            });

            // تحديث عناصر واجهة المستخدم لإجمالي اليوم
            const totalProfitElement = document.getElementById('total-profit');
            const screensProfitElement = document.getElementById('screens-profit');
            const drinksProfitElement = document.getElementById('drinks-profit');
            const hookahProfitElement = document.getElementById('hookah-profit');
            const transactionsCountElement = document.getElementById('transactions-count');

            if (totalProfitElement) totalProfitElement.textContent = totalProfit.toLocaleString() + ' ل.س';
            if (screensProfitElement) screensProfitElement.textContent = screensProfit.toLocaleString() + ' ل.س';
            if (drinksProfitElement) drinksProfitElement.textContent = drinksProfit.toLocaleString() + ' ل.س';
            if (hookahProfitElement) hookahProfitElement.textContent = hookahProfit.toLocaleString() + ' ل.س';
            if (transactionsCountElement) transactionsCountElement.textContent = screenTransactionsCount;

            // التحقق مما إذا كانت هناك معاملات لليوم المحدد
            if (transactions.length === 0) {
                transactionsList.innerHTML = '<div class="no-transactions">لا توجد معاملات لهذا اليوم</div>';
                return;
            }

            // عرض المعاملات بترتيب عكسي (الأحدث أولاً)
            transactions.slice().reverse().forEach(transaction => {
                const transactionItem = document.createElement('div');
                transactionItem.className = 'transaction-item';
                transactionItem.dataset.transaction = JSON.stringify(transaction);

                // تحديد نوع المعاملة ووقتها
                let typeText = '';
                let timeText = '';
                let durationText = '';

                if (transaction.type === 'screen') {
                    typeText = `شاشة ${transaction.screenNumber}`;
                    timeText = new Date(transaction.time).toLocaleTimeString('ar-SA');

                    // إضافة المدة إذا كانت متوفرة
                    if (transaction.duration !== undefined) {
                        durationText = `<div class="transaction-duration">${transaction.duration} دقيقة</div>`;
                    }
                } else if (transaction.type === 'drinks') {
                    typeText = `مشروبات (شاشة ${transaction.screenNumber})`;
                    timeText = new Date(transaction.time).toLocaleTimeString('ar-SA');
                } else if (transaction.type === 'hookah') {
                    typeText = `أراكيل (شاشة ${transaction.screenNumber})`;
                    timeText = new Date(transaction.time).toLocaleTimeString('ar-SA');
                }

                // إنشاء محتوى العنصر
                transactionItem.innerHTML = `
                    <div class="transaction-info">
                        <div class="transaction-type">${typeText}</div>
                        <div class="transaction-time">${timeText}</div>
                        ${durationText}
                    </div>
                    <div class="transaction-cost">${transaction.cost.toLocaleString()} ل.س</div>
                `;

                // إضافة مستمع حدث للنقر لعرض التفاصيل
                transactionItem.addEventListener('click', function() {
                    showTransactionDetails(transaction);
                });

                // إضافة العنصر إلى القائمة
                transactionsList.appendChild(transactionItem);
            });
        }
        
        // جعل الدالة متاحة عالميا
        window.updateDayTransactions = updateDayTransactions;

        // دالة لتحديث الإجمالي الشهري
        function updateMonthlySummary(year, month) {
            // الحصول على جميع معاملات الشهر
            const transactions = getTransactions(year, month);

            // حساب الإجماليات
            let totalScreens = 0;
            let totalDrinks = 0;
            let totalHookah = 0;
            let total = 0;

            // حساب الإجماليات حسب النوع
            transactions.forEach(transaction => {
                if (transaction.type === 'screen') {
                    totalScreens += transaction.cost;
                } else if (transaction.type === 'drinks') {
                    totalDrinks += transaction.cost;
                } else if (transaction.type === 'hookah') {
                    totalHookah += transaction.cost;
                }
                total += transaction.cost;
            });

            // تحديث عناصر واجهة المستخدم
            const monthlyScreensTotal = document.getElementById('monthly-screens-total');
            const monthlyDrinksTotal = document.getElementById('monthly-drinks-total');
            const monthlyHookahTotal = document.getElementById('monthly-hookah-total');
            const monthlyTotal = document.getElementById('monthly-total');

            if (monthlyScreensTotal) monthlyScreensTotal.textContent = totalScreens.toLocaleString() + ' ل.س';
            if (monthlyDrinksTotal) monthlyDrinksTotal.textContent = totalDrinks.toLocaleString() + ' ل.س';
            if (monthlyHookahTotal) monthlyHookahTotal.textContent = totalHookah.toLocaleString() + ' ل.س';
            if (monthlyTotal) monthlyTotal.textContent = total.toLocaleString() + ' ل.س';
            
            // حفظ بيانات الأرباح الشهرية في التخزين المحلي لضمان استمرار عرضها
            // بشكل صحيح حتى في وضع عدم الاتصال بالإنترنت
            const monthlySummaryData = {
                totalScreens,
                totalDrinks,
                totalHookah,
                total,
                lastUpdated: new Date().getTime()
            };
            
            const monthlySummaryKey = getUserStorageKey(`monthlySummary_${year}_${month}`);
            localStorage.setItem(monthlySummaryKey, JSON.stringify(monthlySummaryData));
            
            console.log(`تم تحديث وحفظ ملخص أرباح شهر ${month}/${year}`);
        }
        
        // جعل الدالة متاحة عالميا
        window.updateMonthlySummary = updateMonthlySummary;
    }

    // --- Run Initialization ---
    initialize();

    // Logout Confirmation Modal Elements
    const logoutConfirmOverlay = document.getElementById('logout-confirm-overlay');
    const closeLogoutConfirmBtn = document.getElementById('close-logout-confirm-btn');
    const confirmLogoutBtn = document.getElementById('confirm-logout-btn');
    const cancelLogoutBtn = document.getElementById('cancel-logout-btn');

    // Función para mostrar el modal de confirmación de cierre de sesión
    function openLogoutConfirmModal() {
        // التحقق مما إذا كانت هناك مؤقتات نشطة
        if (hasActiveTimers()) {
            showNotification('لا يمكن تسجيل الخروج أثناء وجود مؤقتات نشطة. قم بإيقاف جميع المؤقتات أولاً.', 'error');
            return;
        }

        logoutConfirmOverlay.classList.add('active');
    }

    // Función para cerrar el modal de confirmación de cierre de sesión
    function closeLogoutConfirmModal() {
        logoutConfirmOverlay.classList.remove('active');
    }

    // Event listeners para el modal de confirmación de cierre de sesión
    closeLogoutConfirmBtn.addEventListener('click', closeLogoutConfirmModal);
    cancelLogoutBtn.addEventListener('click', closeLogoutConfirmModal);
    confirmLogoutBtn.addEventListener('click', performLogout);
    logoutConfirmOverlay.addEventListener('click', (e) => {
        if (e.target === logoutConfirmOverlay) closeLogoutConfirmModal();
    });

    // Función para cerrar sesión
    function performLogout() {
        // Guardar el nombre de usuario antes de eliminarlo
    const username = localStorage.getItem('username') || 'default';

        // Eliminar todas الكلاة المحددة للمستخدم
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(username + '_')) {
                localStorage.removeItem(key);
            }
        });

        // Eliminar الكلاة المحددة للتأكيد
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('username');

        // إذا كنت تريد السماح للمستخدم بتسجيل الدخول مرة أخرى على نفس الجهاز
        // اترك معرف الجهاز كما هو

        // تم تعليق حذف معرف الجهاز للسماح بتسجيل الدخول من نفس الجهاز بعد تسجيل الخروج
        // localStorage.removeItem('deviceId');

        // Recargar الصفحة
        window.location.reload();
    }

    // Asignar الدالة لفتح مودال التأكيد للخروج إلى الزر
    window.logout = openLogoutConfirmModal;

    // إضافة مستمع الحدث لزر مسح سجل المعاملات الجديد وزر مسح بيانات الشهر
    // نستخدم مستمع الحدث على مستوى المستند للتعامل مع النقرات على الأزرار
    document.body.addEventListener('click', function(event) {
        // تم إزالة كود زر مسح سجل المعاملات

        // زر مسح بيانات الشهر
        if (event.target && event.target.id === 'clear-month-btn') {
            console.log('تم النقر على زر مسح بيانات الشهر');
            showClearMonthModal();
        }

        // زر تأكيد مسح بيانات الشهر
        if (event.target && event.target.id === 'confirm-clear-month-btn') {
            console.log('تم النقر على زر تأكيد مسح بيانات الشهر');
            clearMonthData();
        }

        // زر إلغاء مسح بيانات الشهر
        if (event.target && event.target.id === 'cancel-clear-month-btn') {
            console.log('تم النقر على زر إلغاء مسح بيانات الشهر');
            document.getElementById('clear-month-modal').classList.remove('active');
        }

        // زر إغلاق مودال مسح بيانات الشهر
        if (event.target && event.target.id === 'close-clear-month-btn') {
            console.log('تم النقر على زر إغلاق مودال مسح بيانات الشهر');
            document.getElementById('clear-month-modal').classList.remove('active');
        }
    });

    // وظيفة لتحديث عرض أرقام الأراكيل تحت الزر
    function updateHookahValues(screenId) {
        const card = document.querySelector(`.screen-card[data-screen-id="${screenId}"]`);
        if (!card) return;

        const hookahValues = card.querySelector('.hookah-values');
        const hookahs = hookahCosts[screenId] || [];

        if (hookahs.length > 0) {
            // عرض الأرقام من اليمين إلى اليسار مع فاصل بينها
            hookahValues.textContent = hookahs.join(' - ');
        } else {
            hookahValues.textContent = '';
        }
    }

    // Función para mostrar los detalles de una transacción
    function showTransactionDetails(transaction) {
        const detailsModal = document.getElementById('details-modal');
        const detailsContent = document.getElementById('details-content');
        
        // Crear el contenido HTML para los detalles
        let html = '';
        
        // Tipo de transacción
        let typeText = '';
        if (transaction.type === 'screen') {
            typeText = `شاشة ${transaction.screenNumber}`;
        } else if (transaction.type === 'drinks') {
            typeText = `مشروبات (شاشة ${transaction.screenNumber})`;
        } else if (transaction.type === 'hookah') {
            typeText = `أراكيل (شاشة ${transaction.screenNumber})`;
        }
        
        html += `<div class="details-row"><div class="details-label">النوع:</div><div>${typeText}</div></div>`;
        
        // إضافة نوع الحجز (ثنائي/ثلاثي/رباعي) للشاشات
        if (transaction.type === 'screen') {
            let modeText = '';
            if (transaction.screenMode === 'quad') {
                modeText = 'رباعي';
            } else if (transaction.screenMode === 'triple') {
                modeText = 'ثلاثي';
            } else {
                modeText = 'ثنائي';
            }
            
            // إضافة نوع الجهاز (PS4/PS5)
            const deviceText = transaction.screenType === 'ps5' ? 'PS5' : 'PS4';
            
            html += `<div class="details-row"><div class="details-label">نوع الحجز:</div><div>${modeText} (${deviceText})</div></div>`;
        }
        
        // أوقات البدء والانتهاء للشاشات
        if (transaction.type === 'screen') {
            // وقت البدء
            if (transaction.startTime) {
                const startTime = new Date(transaction.startTime);
                const startTimeText = startTime.toLocaleTimeString('ar-SA');
                html += `<div class="details-row"><div class="details-label">وقت البدء:</div><div>${startTimeText}</div></div>`;
            }
            
            // وقت الانتهاء
            if (transaction.endTime) {
                const endTime = new Date(transaction.endTime);
                const endTimeText = endTime.toLocaleTimeString('ar-SA');
                html += `<div class="details-row"><div class="details-label">وقت الانتهاء:</div><div>${endTimeText}</div></div>`;
            }
        } else {
            // للمشروبات والأراكيل نعرض الوقت فقط
            const time = new Date(transaction.time);
            const timeText = time.toLocaleTimeString('ar-SA');
            html += `<div class="details-row"><div class="details-label">الوقت:</div><div>${timeText}</div></div>`;
        }
        
        // Duración (si está disponible)
        if (transaction.duration !== undefined) {
            html += `<div class="details-row"><div class="details-label">المدة:</div><div>${transaction.duration} دقيقة</div></div>`;
        }
        
        // Costo
        html += `<div class="details-row"><div class="details-label">التكلفة:</div><div>${transaction.cost.toLocaleString()} ل.س</div></div>`;
        
        // Actualizar el contenido modal
        detailsContent.innerHTML = html;
        
        // Mostrar el modal
        detailsModal.classList.add('active');
        
        // Configurar el botón de cierre
        const closeBtn = document.getElementById('close-details-btn');
        closeBtn.onclick = function() {
            detailsModal.classList.remove('active');
        };
        
        // Cerrar al hacer clic fuera del modal
        detailsModal.onclick = function(e) {
            if (e.target === detailsModal) {
                detailsModal.classList.remove('active');
            }
        };
    }
    
    // Función para limpiar los datos del mes
    function clearMonthData() {
        const selectedYear = parseInt(document.getElementById('filter-year').value);
        const selectedMonth = parseInt(document.getElementById('filter-month').value);
        
        // Obtener la cantidad de días en el mes
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
        
        // Eliminar los datos de cada día del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const storageKey = getDayTransactionsStorageKey(selectedYear, selectedMonth, day);
            localStorage.removeItem(storageKey);
        }
        
        // Cerrar el modal
        document.getElementById('clear-month-modal').classList.remove('active');
        
        // تخزين معرف الصفحة الرئيسية في التخزين المحلي
        localStorage.setItem('returnToMainView', 'true');
        
        // تحديث الصفحة فورًا للعودة للصفحة الرئيسية
        document.location.href = document.location.href;
    }
    
    // Función para mostrar el modal de confirmación para eliminar datos del mes
    function showClearMonthModal() {
        const modal = document.getElementById('clear-month-modal');
        modal.classList.add('active');
    }

    // دالة لإغلاق مودال المؤقت
    function closeTimerModal() {
        timerModalOverlay.classList.remove('active');
        // إعادة تعيين قيم الإدخال
        minutesInput.value = '';
        costInput.value = '';
        calculatedTime.textContent = '';
        calculatedTime.classList.add('hidden');

        // إعادة تعيين الخيار النشط إلى "بالدقائق"
        timerOptions.forEach(opt => opt.classList.remove('active'));
        timerOptions[0].classList.add('active');
        minutesInputGroup.classList.remove('hidden');
        costInputGroup.classList.add('hidden');
    }

    function startCountdownTimer() {
        // Get the selected screen and input value
        const screenId = timerModalTitle.querySelector('span').textContent;
        const card = document.querySelector(`.screen-card[data-screen-id="${screenId}"]`);
        
        if (!card) {
            alert('لم يتم العثور على الشاشة');
            return;
        }
        
        // Determine the total time in seconds
        let totalSeconds = 0;
        let inputCost = null;

        // Get the active option
        const activeOption = document.querySelector('.timer-option.active');
        if (activeOption.dataset.option === 'minutes') {
            const minutes = parseInt(minutesInput.value);
            if (isNaN(minutes) || minutes <= 0) {
                alert('الرجاء إدخال عدد دقائق صحيح');
                return;
            }
            totalSeconds = minutes * 60;
        } else {
            const cost = parseInt(costInput.value);
            if (isNaN(cost) || cost <= 0) {
                alert('الرجاء إدخال مبلغ صحيح');
                return;
            }

            // تحديد نوع الشاشة (PS4 أو PS5)
            const screenType = screenTypes[screenId] || "ps4";
            
            // تحديد ما إذا كانت الشاشة في وضع رباعي أو ثلاثي أو ثنائي
            const screenMode = screenModes[screenId] || "dual";

            // استخدام السعر المناسب حسب الوضع
            let rate;
            
            if (screenType === "ps5") {
                // استخدام أسعار PS5
                if (screenMode === "quad") {
                    rate = ps5QuadHourlyRate;
                } else if (screenMode === "triple") {
                    rate = ps5TripleHourlyRate;
                } else {
                    rate = ps5HourlyRate;
                }
            } else {
                // استخدام أسعار PS4
            if (screenMode === "quad") {
                rate = quadHourlyRate;
            } else if (screenMode === "triple") {
                rate = tripleHourlyRate;
            } else {
                rate = hourlyRate;
            }
            }
            
            // حساب الوقت بالثواني
            totalSeconds = Math.round((cost / rate) * 3600);
            inputCost = cost;
        }
        
        // التأكد من عدم تشغيل مؤقت العد التنازلي بالفعل لهذه الشاشة
        if (countdownTimers[screenId] && countdownTimers[screenId].intervalId) {
            // إيقاف المؤقت الحالي
            clearInterval(countdownTimers[screenId].intervalId);

            // إزالة عرض العد التنازلي إذا كان موجودًا
            if (countdownTimers[screenId].display && countdownTimers[screenId].display.parentNode) {
                countdownTimers[screenId].display.remove();
            }
        }

        // التأكد من عدم تشغيل مؤقت عادي لهذه الشاشة
        if (screenTimers[screenId] && screenTimers[screenId].intervalId) {
            // إيقاف المؤقت الحالي
            clearInterval(screenTimers[screenId].intervalId);
            screenTimers[screenId].intervalId = null;
        }
        
        // إنشاء عرض العد التنازلي
        const countdownDisplay = document.createElement('div');
        countdownDisplay.classList.add('countdown-display');
        card.appendChild(countdownDisplay);

        // وقت الانتهاء
        const endTime = Date.now() + (totalSeconds * 1000);

        // تحديث واجهة المستخدم لهذه الشاشة فقط
        card.classList.add('active');
        card.querySelector('.start-btn').disabled = true;
        card.querySelector('.stop-btn').disabled = true;
        card.querySelector('.reset-card-btn').disabled = false;
        card.querySelector('.timer-btn').disabled = true;
        card.querySelector('.drinks-btn').disabled = false;
        card.querySelector('.hookah-btn').disabled = false;
        card.querySelector('.previous-bill-btn').disabled = false;
        
        // تحديث عرض أرقام المشروبات والأراكيل
        updateDrinksValues(screenId);
        updateHookahValues(screenId);
        
        // إنشاء مؤقت العد التنازلي
        countdownTimers[screenId] = {
            intervalId: null,
            endTime: endTime,
            totalSeconds: totalSeconds,
            display: countdownDisplay,
            inputCost: inputCost
        };

        // تحديث العد التنازلي فورًا
        updateCountdown(screenId, countdownDisplay);

        // بدء الفاصل الزمني لهذه الشاشة
        countdownTimers[screenId].intervalId = setInterval(() => {
            // التحقق من وجود مؤقت العد التنازلي
            if (!countdownTimers[screenId]) {
                clearInterval(countdownTimers[screenId].intervalId);
                return;
            }

            if (!updateCountdown(screenId, countdownDisplay)) {
                // انتهى الوقت
                clearInterval(countdownTimers[screenId].intervalId);

                // إزالة عرض العد التنازلي إذا كان لا يزال موجودًا
                if (countdownDisplay.parentNode) {
                    countdownDisplay.remove();
                }

                // تحديث بيانات المؤقت
                countdownTimers[screenId].intervalId = null;

                // إظهار جملة تذكير بالتكلفة
                const costDisplay = card.querySelector('.cost-display');

                // تحديد المبلغ المدخل أو حسابه من الدقائق
                let cost = 0;

                try {
                    // الحصول على بيانات المؤقت
                    if (countdownTimers[screenId]) {
                        // التحقق من وجود مبلغ مدخل مسبقاً
                        if (countdownTimers[screenId].inputCost !== null) {
                            // استخدام المبلغ المدخل مسبقاً
                            cost = countdownTimers[screenId].inputCost;
                        } else if (countdownTimers[screenId].totalSeconds) {
                            // تحديد نوع الشاشة (PS4 أو PS5)
                            const screenType = screenTypes[screenId] || "ps4";
                            
                            // تحديد ما إذا كانت الشاشة في وضع رباعي أو ثلاثي أو ثنائي
                            const screenMode = screenModes[screenId] || "dual";

                            // استخدام السعر المناسب حسب الوضع
                            let rate;
                            
                            if (screenType === "ps5") {
                                // استخدام أسعار PS5
                                if (screenMode === "quad") {
                                    rate = ps5QuadHourlyRate;
                                } else if (screenMode === "triple") {
                                    rate = ps5TripleHourlyRate;
                                } else {
                                    rate = ps5HourlyRate;
                                }
                            } else {
                                // استخدام أسعار PS4
                            if (screenMode === "quad") {
                                rate = quadHourlyRate;
                            } else if (screenMode === "triple") {
                                rate = tripleHourlyRate;
                            } else {
                                rate = hourlyRate;
                                }
                            }

                            // حساب التكلفة من الدقائق
                            const minutes = countdownTimers[screenId].totalSeconds / 60;
                            cost = Math.ceil((rate * minutes) / 60);
                        } else {
                            // في حالة عدم وجود بيانات المؤقت
                            cost = 100; // قيمة افتراضية
                        }
                    } else {
                        cost = 100; // قيمة افتراضية
                    }
                } catch (error) {
                    console.error('خطأ في حساب التكلفة:', error);
                    cost = 100; // قيمة افتراضية في حالة الخطأ
                }

                // تطبيق التقريب الجديد على التكلفة
                const roundedCost = roundCost(cost);

                // تسجيل المعاملة في localStorage
                const duration = countdownTimers[screenId] ? countdownTimers[screenId].totalSeconds : 0;
                
                // بدلاً من استدعاء recordTransaction، ننشئ كائن المعاملة مباشرة
                // recordTransaction(screenId, 'screen', roundedCost, duration);
                
                // إنشاء كائن معاملة مخصص بوقت البدء والانتهاء
                const transaction = {
                    id: Date.now().toString(),
                    screenNumber: screenId,
                    type: 'screen',
                    cost: roundedCost,
                    time: new Date().toISOString(),
                    endTime: new Date().toISOString(),
                    startTime: new Date(countdownTimers[screenId].endTime - (countdownTimers[screenId].totalSeconds * 1000)).toISOString(),
                    duration: Math.round(countdownTimers[screenId].totalSeconds / 60), // بالدقائق
                    screenMode: screenModes[screenId] || "dual",
                    screenType: screenTypes[screenId] || "ps4"
                };

                // الحصول على التاريخ المعدل (اليوم ينتهي في الساعة 6 صباحًا)
                const currentDate = getAdjustedDate();
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;
                const day = currentDate.getDate();
                
                // الحصول على المعاملات الحالية
                const transactions = getTransactions(year, month, day);
                
                // إضافة المعاملة الجديدة
                transactions.push(transaction);
                
                // حفظ المعاملات المحدثة
                const dayStorageKey = getDayTransactionsStorageKey(year, month, day);
                localStorage.setItem(dayStorageKey, JSON.stringify(transactions));
                
                // الحصول على تكاليف المشروبات
                const drinks = drinksCosts[screenId] || [];
                const totalDrinksCost = drinks.reduce((sum, cost) => sum + cost, 0);

                // الحصول على تكاليف الأراكيل
                const hookahs = hookahCosts[screenId] || [];
                const totalHookahCost = hookahs.reduce((sum, cost) => sum + cost, 0);

                // تنسيق العرض مع تكلفة الشاشة وتكاليف المشروبات والمجموع
                let displayText = `<div class="cost-item"><span>تكلفة الوقت</span><span>${roundedCost}</span></div>`;
                let hasExtras = false;

                if (drinks.length > 0) {
                    displayText += `<div class="cost-item"><span>المشروبات</span><span>${totalDrinksCost}</span></div>`;
                    hasExtras = true;
                }

                if (hookahs.length > 0) {
                    displayText += `<div class="cost-item"><span>الأراكيل</span><span>${totalHookahCost}</span></div>`;
                    hasExtras = true;
                }

                // إضافة الفواتير السابقة إذا وجدت
                let previousBillsCost = 0;
                
                if (window.previousBills && window.previousBills[screenId] && window.previousBills[screenId].length > 0) {
                    const bills = window.previousBills[screenId];
                    for (const bill of bills) {
                        displayText += `<div class="cost-item"><span>فاتورة سابقة</span><span>${bill.cost} ل.س</span></div>`;
                        previousBillsCost += bill.cost;
                        hasExtras = true;
                    }
                    // مسح مصفوفة الفواتير بعد إضافتها للتكلفة
                    window.previousBills[screenId] = [];
                }

                // حساب المجموع النهائي مع الفواتير السابقة
                const finalTotal = totalDrinksCost + totalHookahCost + roundedCost + previousBillsCost;

                if (hasExtras) {
                    displayText += `<div class="cost-total"><span>المجموع</span><span>${finalTotal}</span></div>`;
                } else {
                    displayText += `<div class="cost-total"><span>المجموع</span><span>${roundedCost}</span></div>`;
                }

                // إظهار التكلفة
                costDisplay.innerHTML = displayText;
                costDisplay.classList.add('visible');

                // إخفاء أرقام المشروبات والأراكيل تحت الأزرار بعد عرض التكلفة النهائية
                const drinksValues = card.querySelector('.drinks-values');
                const hookahValues = card.querySelector('.hookah-values');
                drinksValues.textContent = '';
                hookahValues.textContent = '';
                
                // التعامل مع previousBillValues بأمان
                try {
                    const previousBillElement = card.querySelector('.previous-bill-values');
                    if (previousBillElement) {
                        previousBillElement.textContent = '';
                    }
                } catch (e) {
                    console.log('لا يوجد عنصر للفواتير السابقة', e);
                }

                // Reset card
                // لا نستدعي resetCard لأننا نريد إبقاء جملة التذكير ظاهرة
                // نقوم فقط بإعادة ضبط حالة الأزرار
                card.classList.remove('active');
                card.querySelector('.start-btn').disabled = !hourlyRate;
                card.querySelector('.stop-btn').disabled = true;
                card.querySelector('.reset-card-btn').disabled = false;
                card.querySelector('.timer-btn').disabled = !hourlyRate;
                card.querySelector('.drinks-btn').disabled = !hourlyRate;
                card.querySelector('.hookah-btn').disabled = !hourlyRate;
                card.querySelector('.previous-bill-btn').disabled = !hourlyRate;
                
                // تحديث الأرباح الشهرية فوراً
                forceUpdateMonthlyProfits();

                // Show notification with the screen number
                const screenNumber = card.querySelector('h3').textContent.match(/\d+/)[0];
                showNotification(`انتهى وقت الشاشة ${screenNumber}`);
            }
        }, 1000);

        // Close modal
        closeTimerModal();
    }

    // دالة لفتح مودال المؤقت
    function openTimerModal(card, screenId) {
        timerModalTitle.querySelector('span').textContent = screenId;
        timerModalOverlay.classList.add('active');
        
        // إعادة تعيين الخيارات إلى الوضع الافتراضي
        timerOptions.forEach(opt => opt.classList.remove('active'));
        timerOptions[0].classList.add('active');
        
        // إظهار حقل الدقائق وإخفاء حقل التكلفة
        minutesInputGroup.classList.remove('hidden');
        costInputGroup.classList.add('hidden');
        
        // إعادة تعيين قيم الإدخال
        minutesInput.value = '';
        costInput.value = '';
        calculatedTime.textContent = '';
        calculatedTime.classList.add('hidden');
        
        // تركيز على حقل الدقائق
        setTimeout(() => minutesInput.focus(), 100);
    }

    // دالة لحساب الوقت من التكلفة
    function calculateTimeFromCost() {
        const cost = parseFloat(costInput.value);
        if (isNaN(cost) || cost <= 0) {
            calculatedTime.classList.add('hidden');
            return;
        }

        // الحصول على معرف الشاشة من العنوان
        const screenId = timerModalTitle.querySelector('span').textContent;
        
        // تحديد نوع الشاشة (PS4 أو PS5)
        const screenType = screenTypes[screenId] || "ps4";
        
        // تحديد ما إذا كانت الشاشة في وضع رباعي أو ثلاثي أو ثنائي
        const screenMode = screenModes[screenId] || "dual";
        
        // استخدام السعر المناسب حسب الوضع
        let rate;
        
        if (screenType === "ps5") {
            // استخدام أسعار PS5
            if (screenMode === "quad") {
                rate = ps5QuadHourlyRate;
            } else if (screenMode === "triple") {
                rate = ps5TripleHourlyRate;
            } else {
                rate = ps5HourlyRate;
            }
        } else {
            // استخدام أسعار PS4
            if (screenMode === "quad") {
                rate = quadHourlyRate;
            } else if (screenMode === "triple") {
                rate = tripleHourlyRate;
            } else {
                rate = hourlyRate;
            }
        }
        
        // حساب الوقت بالثواني
        const totalSeconds = (cost / rate) * 3600;
        
        // حساب الدقائق والثواني
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.round(totalSeconds % 60);
        
        // عرض الوقت المحسوب بالدقائق والثواني
        calculatedTime.textContent = `${minutes} دقيقة و ${seconds} ثانية`;
        calculatedTime.classList.remove('hidden');
    }

    // وظيفة لتحديث عرض أرقام المشروبات تحت الزر
    function updateDrinksValues(screenId) {
        const card = document.querySelector(`.screen-card[data-screen-id="${screenId}"]`);
        if (!card) return;

        const drinksValues = card.querySelector('.drinks-values');
        const drinks = drinksCosts[screenId] || [];

        if (drinks.length > 0) {
            // عرض الأرقام من اليمين إلى اليسار مع فاصل بينها
            drinksValues.textContent = drinks.join(' - ');
        } else {
            drinksValues.textContent = '';
        }
    }

    // وظيفة لتحديث عرض أرقام الأراكيل تحت الزر
    function updateHookahValues(screenId) {
        const card = document.querySelector(`.screen-card[data-screen-id="${screenId}"]`);
        if (!card) return;

        const hookahValues = card.querySelector('.hookah-values');
        const hookahs = hookahCosts[screenId] || [];

        if (hookahs.length > 0) {
            // عرض الأرقام من اليمين إلى اليسار مع فاصل بينها
            hookahValues.textContent = hookahs.join(' - ');
        } else {
            hookahValues.textContent = '';
        }
    }

    // دالة لفتح مودال المشروبات
    function openDrinksModal(card, screenId) {
        drinksModalTitle.querySelector('span').textContent = screenId;
        drinksModalOverlay.classList.add('active');
        drinksCostInput.value = '';
        setTimeout(() => drinksCostInput.focus(), 100);
    }

    // دالة لإغلاق مودال المشروبات
    function closeDrinksModal() {
        drinksModalOverlay.classList.remove('active');
    }

    // دالة لإضافة تكلفة مشروبات
    function addDrinksCost() {
        const cost = parseInt(drinksCostInput.value);
        if (isNaN(cost) || cost <= 0) {
            alert('الرجاء إدخال قيمة صحيحة أكبر من الصفر');
            return;
        }

        const screenId = drinksModalTitle.querySelector('span').textContent;
        
        // إنشاء المصفوفة إذا لم تكن موجودة
        if (!drinksCosts[screenId]) {
            drinksCosts[screenId] = [];
        }
        
        // إضافة تكلفة المشروبات
        drinksCosts[screenId].push(cost);
        
        // تسجيل المعاملة
        recordTransaction(screenId, 'drinks', cost);
        
        // تحديث عرض أرقام المشروبات
        updateDrinksValues(screenId);
        
        // إغلاق المودال
        closeDrinksModal();
        
        // تحديث الأرباح الشهرية فوراً
        forceUpdateMonthlyProfits();
    }

    // دالة لفتح مودال الأراكيل
    function openHookahModal(card, screenId) {
        hookahModalTitle.querySelector('span').textContent = screenId;
        hookahModalOverlay.classList.add('active');
        hookahCostInput.value = '';
        setTimeout(() => hookahCostInput.focus(), 100);
    }

    // دالة لإغلاق مودال الأراكيل
    function closeHookahModal() {
        hookahModalOverlay.classList.remove('active');
    }

    // دالة لإضافة تكلفة أراكيل
    function addHookahCost() {
        const cost = parseInt(hookahCostInput.value);
        if (isNaN(cost) || cost <= 0) {
            alert('الرجاء إدخال قيمة صحيحة أكبر من الصفر');
            return;
        }

        const screenId = hookahModalTitle.querySelector('span').textContent;
        
        // إنشاء المصفوفة إذا لم تكن موجودة
        if (!hookahCosts[screenId]) {
            hookahCosts[screenId] = [];
        }
        
        // إضافة تكلفة الأراكيل
        hookahCosts[screenId].push(cost);
        
        // تسجيل المعاملة
        recordTransaction(screenId, 'hookah', cost);
        
        // تحديث عرض أرقام الأراكيل
        updateHookahValues(screenId);
        
        // إغلاق المودال
        closeHookahModal();
        
        // تحديث الأرباح الشهرية فوراً
        forceUpdateMonthlyProfits();
    }

    // دالة لفتح مودال الفاتورة السابقة
    function openPreviousBillModal(card, screenId) {
        previousBillModalTitle.querySelector('span').textContent = screenId;
        previousBillModalOverlay.classList.add('active');
        previousBillCostInput.value = '';
        setTimeout(() => previousBillCostInput.focus(), 100);
    }

    // دالة لإغلاق مودال الفاتورة السابقة
    function closePreviousBillModal() {
        previousBillModalOverlay.classList.remove('active');
    }

    // دالة لتحديث عرض أرقام الفواتير السابقة تحت الزر
    function updatePreviousBillValues(screenId) {
        const card = document.querySelector(`.screen-card[data-screen-id="${screenId}"]`);
        if (!card) return;

        const previousBillValues = card.querySelector('.previous-bill-values');
        const bills = window.previousBills && window.previousBills[screenId] ? window.previousBills[screenId] : [];

        if (bills.length > 0) {
            // عرض المبالغ من اليمين إلى اليسار مع فاصل بينها
            const billAmounts = bills.map(bill => bill.cost);
            previousBillValues.textContent = billAmounts.join(' - ');
        } else {
            previousBillValues.textContent = '';
        }
    }

    // دالة لإضافة فاتورة سابقة
    function addPreviousBill() {
        const cost = parseInt(previousBillCostInput.value);
        if (isNaN(cost) || cost <= 0) {
            alert('الرجاء إدخال قيمة صحيحة أكبر من الصفر');
            return;
        }

        const screenId = previousBillModalTitle.querySelector('span').textContent;
        const note = 'فاتورة سابقة'; // استخدام قيمة افتراضية ثابتة
        
        // إنشاء المصفوفة العامة للفواتير السابقة إذا لم تكن موجودة
        if (!window.previousBills) {
            window.previousBills = {};
        }
        
        // إنشاء المصفوفة لهذه الشاشة إذا لم تكن موجودة
        if (!window.previousBills[screenId]) {
            window.previousBills[screenId] = [];
        }
        
        // إضافة الفاتورة السابقة
        window.previousBills[screenId].push({
            cost: cost,
            note: note
        });
        
        // تحديث عرض أرقام الفواتير السابقة
        updatePreviousBillValues(screenId);
        
        // إغلاق المودال
        closePreviousBillModal();
        
        // تحديث الأرباح الشهرية فوراً
        forceUpdateMonthlyProfits();
    }

    // دالة لتهيئة مراقب تغييرات الأرباح
    function setupProfitsObserver() {
        // وظيفة لتحديث الأرباح الشهرية عند أي تغيير
        function updateProfitsDisplay() {
            // التحقق إذا كانت صفحة الأرباح مفتوحة
            const profitsView = document.getElementById('profits-view');
            if (!profitsView || profitsView.classList.contains('hidden')) {
                return; // لا داعي للتحديث إذا كانت الصفحة غير مرئية
            }

            // الحصول على الشهر والسنة المحددين
            const yearFilter = document.getElementById('filter-year');
            const monthFilter = document.getElementById('filter-month');
            
            if (!yearFilter || !monthFilter) {
                return;
            }
            
            const year = parseInt(yearFilter.value);
            const month = parseInt(monthFilter.value);
            
            // تحديث إجمالي الشهر
            // الحصول على جميع معاملات الشهر
            const transactions = getTransactions(year, month);

            // حساب الإجماليات
            let totalScreens = 0;
            let totalDrinks = 0;
            let totalHookah = 0;
            let total = 0;

            // حساب الإجماليات حسب النوع
            transactions.forEach(transaction => {
                if (transaction.type === 'screen') {
                    totalScreens += transaction.cost;
                } else if (transaction.type === 'drinks') {
                    totalDrinks += transaction.cost;
                } else if (transaction.type === 'hookah') {
                    totalHookah += transaction.cost;
                }
                total += transaction.cost;
            });

            // تحديث عناصر واجهة المستخدم للإجمالي الشهري
            const monthlyScreensTotal = document.getElementById('monthly-screens-total');
            const monthlyDrinksTotal = document.getElementById('monthly-drinks-total');
            const monthlyHookahTotal = document.getElementById('monthly-hookah-total');
            const monthlyTotal = document.getElementById('monthly-total');

            if (monthlyScreensTotal) monthlyScreensTotal.textContent = totalScreens.toLocaleString() + ' ل.س';
            if (monthlyDrinksTotal) monthlyDrinksTotal.textContent = totalDrinks.toLocaleString() + ' ل.س';
            if (monthlyHookahTotal) monthlyHookahTotal.textContent = totalHookah.toLocaleString() + ' ل.س';
            if (monthlyTotal) monthlyTotal.textContent = total.toLocaleString() + ' ل.س';
            
            // تحديث معاملات اليوم المحدد
            const activeDayItem = document.querySelector('.day-item.active');
            if (activeDayItem) {
                const day = parseInt(activeDayItem.querySelector('.day-number').textContent);
                // تحديث بيانات اليوم
                const dayTransactions = getTransactions(year, month, day);
                updateDailyTransactionsDisplay(dayTransactions);
            }
        }
        
        // دالة لتحديث عرض معاملات اليوم
        function updateDailyTransactionsDisplay(transactions) {
            const transactionsList = document.getElementById('transactions-list');
            if (!transactionsList) return;

            // تفريغ قائمة المعاملات
            transactionsList.innerHTML = '';

            // حساب إجمالي اليوم
            let totalProfit = 0;
            let screensProfit = 0;
            let drinksProfit = 0;
            let hookahProfit = 0;
            let screenTransactionsCount = 0;

            // حساب الإجماليات
            transactions.forEach(transaction => {
                if (transaction.type === 'screen') {
                    screensProfit += transaction.cost;
                    screenTransactionsCount++;
                } else if (transaction.type === 'drinks') {
                    drinksProfit += transaction.cost;
                } else if (transaction.type === 'hookah') {
                    hookahProfit += transaction.cost;
                }
                totalProfit += transaction.cost;
            });

            // تحديث عناصر واجهة المستخدم لإجمالي اليوم
            const totalProfitElement = document.getElementById('total-profit');
            const screensProfitElement = document.getElementById('screens-profit');
            const drinksProfitElement = document.getElementById('drinks-profit');
            const hookahProfitElement = document.getElementById('hookah-profit');
            const transactionsCountElement = document.getElementById('transactions-count');

            if (totalProfitElement) totalProfitElement.textContent = totalProfit.toLocaleString() + ' ل.س';
            if (screensProfitElement) screensProfitElement.textContent = screensProfit.toLocaleString() + ' ل.س';
            if (drinksProfitElement) drinksProfitElement.textContent = drinksProfit.toLocaleString() + ' ل.س';
            if (hookahProfitElement) hookahProfitElement.textContent = hookahProfit.toLocaleString() + ' ل.س';
            if (transactionsCountElement) transactionsCountElement.textContent = screenTransactionsCount;

            // التحقق مما إذا كانت هناك معاملات لليوم المحدد
            if (transactions.length === 0) {
                transactionsList.innerHTML = '<div class="no-transactions">لا توجد معاملات لهذا اليوم</div>';
                return;
            }

            // عرض المعاملات بترتيب عكسي (الأحدث أولاً)
            transactions.slice().reverse().forEach(transaction => {
                const transactionItem = document.createElement('div');
                transactionItem.className = 'transaction-item';
                transactionItem.dataset.transaction = JSON.stringify(transaction);

                // تحديد نوع المعاملة ووقتها
                let typeText = '';
                let timeText = '';
                let durationText = '';

                if (transaction.type === 'screen') {
                    typeText = `شاشة ${transaction.screenNumber}`;
                    timeText = new Date(transaction.time).toLocaleTimeString('ar-SA');

                    // إضافة المدة إذا كانت متوفرة
                    if (transaction.duration !== undefined) {
                        durationText = `<div class="transaction-duration">${transaction.duration} دقيقة</div>`;
                    }
                } else if (transaction.type === 'drinks') {
                    typeText = `مشروبات (شاشة ${transaction.screenNumber})`;
                    timeText = new Date(transaction.time).toLocaleTimeString('ar-SA');
                } else if (transaction.type === 'hookah') {
                    typeText = `أراكيل (شاشة ${transaction.screenNumber})`;
                    timeText = new Date(transaction.time).toLocaleTimeString('ar-SA');
                }

                // إنشاء محتوى العنصر
                transactionItem.innerHTML = `
                    <div class="transaction-info">
                        <div class="transaction-type">${typeText}</div>
                        <div class="transaction-time">${timeText}</div>
                        ${durationText}
                    </div>
                    <div class="transaction-cost">${transaction.cost.toLocaleString()} ل.س</div>
                `;

                // إضافة مستمع حدث للنقر لعرض التفاصيل
                transactionItem.addEventListener('click', function() {
                    showTransactionDetails(transaction);
                });

                // إضافة العنصر إلى القائمة
                transactionsList.appendChild(transactionItem);
            });
        }

        // إنشاء المراقب للتخزين المحلي
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            // استدعاء الدالة الأصلية أولاً
            originalSetItem.apply(this, arguments);
            
            // التحقق إذا كانت المفتاح يتعلق بالمعاملات
            if (key.includes('transactions_')) {
                // تحديث عرض الأرباح
                setTimeout(updateProfitsDisplay, 0);
            }
        };
        
        // وضع updateProfitsDisplay في كائن window لاستخدامها من أي مكان
        window.updateProfitsDisplay = updateProfitsDisplay;
    }

    // تفعيل مراقب الأرباح عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', function() {
        setupProfitsObserver();
    });

    // دالة بسيطة لتحديث الأرباح الشهرية مباشرة
    function forceUpdateMonthlyProfits() {
        console.log("تحديث الأرباح الشهرية فوراً");
        
        // التحقق مما إذا كانت صفحة الأرباح مفتوحة
        const profitsView = document.getElementById('profits-view');
        if (!profitsView || profitsView.classList.contains('hidden')) {
            return; // لا داعي للتحديث إذا كانت صفحة الأرباح غير ظاهرة
        }
        
        // الحصول على السنة والشهر الحاليين
        const yearFilter = document.getElementById('filter-year');
        const monthFilter = document.getElementById('filter-month');
        
        if (!yearFilter || !monthFilter) {
            return;
        }
        
        const year = parseInt(yearFilter.value);
        const month = parseInt(monthFilter.value);
        
        console.log(`تحديث أرباح شهر ${month}/${year}`);
        
        // تحديث ملخص الأرباح الشهرية أولاً
        updateMonthlySummary(year, month);

        // الحصول على اليوم النشط (المحدد) حالياً
        const activeDayItem = document.querySelector('.day-item.active');
        if (activeDayItem) {
            const day = parseInt(activeDayItem.querySelector('.day-number').textContent);
            
            // تحديث معاملات اليوم المحدد
            console.log(`تحديث معاملات يوم ${day} من شهر ${month}/${year}`);
            
            // نستخدم updateDayTransactions إذا كانت متاحة في المجال العام
            if (window.updateDayTransactions) {
                window.updateDayTransactions(year, month, day);
            } else {
                // الحصول على معاملات اليوم المحدد
                const dayTransactions = getTransactions(year, month, day);
                
                // تحديث عناصر واجهة المستخدم لليوم المحدد
                const totalProfitElement = document.getElementById('total-profit');
                const screensProfitElement = document.getElementById('screens-profit');
                const drinksProfitElement = document.getElementById('drinks-profit');
                const hookahProfitElement = document.getElementById('hookah-profit');
                const transactionsCountElement = document.getElementById('transactions-count');
                
                let dayTotalProfit = 0;
                let dayScreensProfit = 0;
                let dayDrinksProfit = 0;
                let dayHookahProfit = 0;
                let dayScreenTransactionsCount = 0;
                
                dayTransactions.forEach(transaction => {
                    if (transaction.type === 'screen') {
                        dayScreensProfit += transaction.cost;
                        dayScreenTransactionsCount++;
                    } else if (transaction.type === 'drinks') {
                        dayDrinksProfit += transaction.cost;
                    } else if (transaction.type === 'hookah') {
                        dayHookahProfit += transaction.cost;
                    }
                    dayTotalProfit += transaction.cost;
                });
                
                if (totalProfitElement) totalProfitElement.textContent = dayTotalProfit.toLocaleString() + ' ل.س';
                if (screensProfitElement) screensProfitElement.textContent = dayScreensProfit.toLocaleString() + ' ل.س';
                if (drinksProfitElement) drinksProfitElement.textContent = dayDrinksProfit.toLocaleString() + ' ل.س';
                if (hookahProfitElement) hookahProfitElement.textContent = dayHookahProfit.toLocaleString() + ' ل.س';
                if (transactionsCountElement) transactionsCountElement.textContent = dayScreenTransactionsCount;
                
                // تحديث قائمة المعاملات
                const transactionsList = document.getElementById('transactions-list');
                if (transactionsList) {
                    // مسح القائمة الحالية
                    transactionsList.innerHTML = '';
                    
                    if (dayTransactions.length === 0) {
                        transactionsList.innerHTML = '<div class="no-transactions">لا توجد معاملات لهذا اليوم</div>';
                    } else {
                        // إضافة المعاملات بترتيب عكسي (الأحدث أولاً)
                        dayTransactions.slice().reverse().forEach(transaction => {
                            const transactionItem = document.createElement('div');
                            transactionItem.className = 'transaction-item';
                            transactionItem.dataset.transaction = JSON.stringify(transaction);
                            
                            // تحديد نوع المعاملة ووقتها
                            let typeText = '';
                            let timeText = '';
                            let durationText = '';
                            
                            if (transaction.type === 'screen') {
                                typeText = `شاشة ${transaction.screenNumber}`;
                                timeText = new Date(transaction.time).toLocaleTimeString('ar-SA');
                                
                                // إضافة المدة إذا كانت متوفرة
                                if (transaction.duration !== undefined) {
                                    durationText = `<div class="transaction-duration">${transaction.duration} دقيقة</div>`;
                                }
                            } else if (transaction.type === 'drinks') {
                                typeText = `مشروبات (شاشة ${transaction.screenNumber})`;
                                timeText = new Date(transaction.time).toLocaleTimeString('ar-SA');
                            } else if (transaction.type === 'hookah') {
                                typeText = `أراكيل (شاشة ${transaction.screenNumber})`;
                                timeText = new Date(transaction.time).toLocaleTimeString('ar-SA');
                            }
                            
                            // إنشاء محتوى العنصر
                            transactionItem.innerHTML = `
                                <div class="transaction-info">
                                    <div class="transaction-type">${typeText}</div>
                                    <div class="transaction-time">${timeText}</div>
                                    ${durationText}
                                </div>
                                <div class="transaction-cost">${transaction.cost.toLocaleString()} ل.س</div>
                            `;
                            
                            // إضافة مستمع حدث للنقر لعرض التفاصيل
                            transactionItem.addEventListener('click', function() {
                                showTransactionDetails(transaction);
                            });
                            
                            // إضافة العنصر إلى القائمة
                            transactionsList.appendChild(transactionItem);
                        });
                    }
                }
            }
        }
        
        console.log("تم تحديث الأرباح الشهرية واليومية بنجاح");
    }
});

// تعريف متغيرات عامة قبل استخدامها
window.checkAuthentication = checkAuthentication;
window.previousBillValues = {}; // تعريف متغير الفواتير السابقة

// This function runs when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!checkAuthentication()) {
        // Show login modal if not authenticated
        const loginModal = document.getElementById('login-modal-overlay');
        loginModal.classList.add('active');
        setupLoginSystem();
    } else {
        // Initialize app if authenticated
        initialize();
        
        // التحقق مما إذا كنا نحتاج للعودة إلى الصفحة الرئيسية بعد مسح بيانات الشهر
        if (localStorage.getItem('returnToMainView') === 'true') {
            // حذف العلامة من التخزين المحلي
            localStorage.removeItem('returnToMainView');
            
            // إظهار الصفحة الرئيسية (شاشات اللعب) وإخفاء صفحة الأرباح
            document.getElementById('main-app-view').classList.remove('hidden');
            document.getElementById('profits-view').classList.add('hidden');
        }
    }
});