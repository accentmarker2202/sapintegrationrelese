// ============================================================
// VERCEL BACKEND URL
// ============================================================

const API_BASE =
    "https://secure-chat-backend-eight.vercel.app/api";

const VERIFY_DATE_API =
    `${API_BASE}/verify-date`;

const LOGIN_API =
    `${API_BASE}/login`;

const MESSAGES_API =
    `${API_BASE}/messages`;

const LOGOUT_API =
    `${API_BASE}/logout`;


// ============================================================
// APPLICATION STATE
// ============================================================

let chatInitialized = false;

let messagePolling = null;

let lastMessageSignature = "";

let chatAuthenticated = false;

let csrfToken = "";


// ============================================================
// LOAD SAP CONTENT
// ============================================================

function loadSapContent() {

    const sapContent = `
        <h3>What is SAP Integration Module?</h3>

        <p>
            The SAP Integration Module is a comprehensive suite of
            tools and services designed to connect various business
            systems, applications, and data sources within an
            enterprise environment. It provides seamless integration
            between SAP systems and third-party applications, enabling
            real-time data synchronization and process automation.
        </p>

        <h3>Key Features:</h3>

        <p>
            <strong>• Real-time Data Exchange:</strong>
            Synchronize data across multiple systems instantaneously,
            ensuring consistency and accuracy throughout the enterprise.
        </p>

        <p>
            <strong>• API Management:</strong>
            Manage and monitor APIs for secure and efficient
            communication between applications.
        </p>

        <p>
            <strong>• Workflow Automation:</strong>
            Automate business processes by connecting different
            systems and reducing manual interventions.
        </p>

        <p>
            <strong>• Error Handling & Monitoring:</strong>
            Comprehensive logging and monitoring capabilities to track
            integration activities and troubleshoot issues.
        </p>

        <p>
            <strong>• Security & Compliance:</strong>
            Enterprise-grade security features including encryption,
            authentication, and role-based access control.
        </p>

        <h3>Common Integration Scenarios:</h3>

        <p>
            <strong>• ERP Integration:</strong>
            Connect SAP ERP with CRM, HCM, and other business
            applications for unified data management.
        </p>

        <p>
            <strong>• Cloud Integration:</strong>
            Integrate SAP systems with cloud-based applications and
            services for enhanced scalability.
        </p>

        <p>
            <strong>• Data Warehouse Integration:</strong>
            Load data from SAP systems into data warehouses for
            analytics and business intelligence.
        </p>

        <p>
            <strong>• Legacy System Integration:</strong>
            Bridge the gap between SAP systems and legacy applications
            to modernize IT infrastructure.
        </p>

        <h3>Benefits:</h3>

        <p>
            ✓ Improved data consistency across the enterprise<br>
            ✓ Reduced manual data entry and errors<br>
            ✓ Enhanced operational efficiency<br>
            ✓ Better decision-making through real-time insights<br>
            ✓ Faster time-to-market for new processes<br>
            ✓ Scalability and flexibility for business growth
        </p>

        <h3>Technical Architecture:</h3>

        <p>
            The integration layer typically consists of middleware,
            connectors, adapters, and APIs that facilitate communication
            between systems. It includes message queuing, data
            transformation, and security mechanisms to ensure reliable
            and secure data transfer.
        </p>

        <h3>Implementation Best Practices:</h3>

        <p>
            <strong>• Plan Before Implementation:</strong>
            Define clear objectives and mapping requirements before
            starting integration projects.
        </p>

        <p>
            <strong>• Ensure Data Quality:</strong>
            Implement validation rules and data cleansing processes to
            maintain data integrity.
        </p>

        <p>
            <strong>• Test Thoroughly:</strong>
            Conduct comprehensive testing including unit tests,
            integration tests, and user acceptance testing.
        </p>

        <p>
            <strong>• Monitor Performance:</strong>
            Continuously monitor integration processes and optimize
            performance for better efficiency.
        </p>

        <p>
            <strong>• Document Everything:</strong>
            Maintain detailed documentation for future maintenance
            and troubleshooting.
        </p>

        <h3>Future Trends:</h3>

        <p>
            The SAP Integration Module continues to evolve with
            emerging technologies including AI-powered data matching,
            blockchain for secure transactions, and IoT device
            integration for real-time operational data. Cloud-native
            architectures and microservices are becoming the standard
            for modern integration platforms.
        </p>
    `;

    document.getElementById(
        "sapText"
    ).innerHTML = sapContent;
}


// ============================================================
// SHOW PASSWORD SCREEN
// ============================================================

function showChatPasswordGate() {

    document
        .getElementById("askmeContainer")
        .classList.add("visible");


    document
        .getElementById("chatPasswordGate")
        .classList.add("visible");


    document
        .getElementById("authenticatedChat")
        .classList.remove("visible");


    document
        .getElementById("sapContainer")
        .style.display = "none";


    document
        .getElementById("passwordError")
        .textContent = "";


    document
        .getElementById("chatPassword")
        .value = "";


    setTimeout(() => {

        document
            .getElementById("chatPassword")
            .focus();

    }, 100);
}


// ============================================================
// VERIFY DATE
//
// IMPORTANT:
// The target date is calculated ONLY by Vercel.
// There is deliberately NO getTargetDate()
// function in this frontend.
// ============================================================

async function verifyDate() {

    const dateInput =
        document
            .getElementById("dateInput")
            .value
            .trim();


    const dateError =
        document.getElementById(
            "dateError"
        );


    const button =
        document.getElementById(
            "verifyDateButton"
        );


    dateError.textContent = "";


    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
            dateInput
        )
    ) {

        dateError.textContent =
            "Please enter the date in YYYY-MM-DD format.";

        return;
    }


    try {

        button.disabled = true;

        button.textContent =
            "Checking...";


        console.log(
            "========== DATE VERIFICATION =========="
        );

        console.log(
            "Date verification started."
        );


        const response =
            await fetch(
                VERIFY_DATE_API,
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body: JSON.stringify({
                        date: dateInput
                    })
                }
            );


        console.log(
            "Date verification HTTP status:",
            response.status
        );


        const result =
            await response.json();


        console.log(
            "Date verification response:",
            result
        );


        if (
            response.ok &&
            result.success
        ) {

            console.log(
                "DATE VERIFIED SUCCESSFULLY"
            );

            showChatPasswordGate();

        } else {

            console.error(
                "DATE VERIFICATION FAILED"
            );

            dateError.textContent =
                "The date is not valid. Please try again.";
        }


    } catch (error) {

        console.error(
            "Date verification error:",
            error
        );


        dateError.textContent =
            "Unable to verify the date. Please try again.";

    } finally {

        button.disabled = false;

        button.textContent =
            "Continue";
    }
}


// ============================================================
// PASSWORD LOGIN - MOBILE DEBUG VERSION
// ============================================================

async function loginToChat(event) {

    event.preventDefault();


    const passwordInput =
        document.getElementById(
            "chatPassword"
        );


    const errorElement =
        document.getElementById(
            "passwordError"
        );


    const unlockButton =
        document.getElementById(
            "unlockButton"
        );


    if (!passwordInput) {

        console.error(
            "ERROR: chatPassword input not found."
        );

        return;
    }


    const password =
        passwordInput.value;


    if (!password) {

        return;
    }


    errorElement.textContent = "";


    unlockButton.disabled = true;

    unlockButton.textContent =
        "Checking...";


    // ========================================================
    // SAFE DEBUG INFORMATION
    // NEVER PRINT THE ACTUAL PASSWORD
    // ========================================================

    console.log(
        "============================================"
    );

    console.log(
        "        SECURE LOGIN DEBUG START"
    );

    console.log(
        "============================================"
    );


    console.log(
        "Browser:",
        navigator.userAgent
    );


    console.log(
        "Frontend origin:",
        window.location.origin
    );


    console.log(
        "Backend API:",
        API_BASE
    );


    console.log(
        "Password length:",
        password.length
    );


    console.log(
        "Password character codes:",
        [...password].map(
            character =>
                character.charCodeAt(0)
        )
    );


    /*
     * IMPORTANT:
     *
     * We do NOT print the actual password.
     */


    console.log(
        "Cookies visible to JavaScript BEFORE login:",
        document.cookie
    );


    console.log(
        "CSRF token currently stored:",
        csrfToken
            ? "YES"
            : "NO"
    );


    // ========================================================
    // LOGIN REQUEST
    // ========================================================

    try {

        console.log(
            "Sending login request..."
        );


        const response =
            await fetch(
                LOGIN_API,
                {
                    method: "POST",

                    /*
                     * VERY IMPORTANT FOR MOBILE:
                     */
                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body: JSON.stringify({
                        password: password
                    })
                }
            );


        console.log(
            "LOGIN HTTP STATUS:",
            response.status
        );


        console.log(
            "LOGIN RESPONSE URL:",
            response.url
        );


        // ====================================================
        // RESPONSE HEADERS
        // ====================================================

        console.log(
            "LOGIN RESPONSE HEADERS:"
        );


        for (
            const [
                key,
                value
            ]
            of response.headers.entries()
        ) {

            /*
             * Browsers normally prevent JavaScript from
             * reading Set-Cookie.
             *
             * Therefore we don't expect to see the actual
             * chat_session cookie here.
             */

            if (
                key.toLowerCase() ===
                "set-cookie"
            ) {

                console.log(
                    "set-cookie: browser-managed/hidden"
                );

            } else {

                console.log(
                    `${key}:`,
                    value
                );
            }
        }


        // ====================================================
        // READ LOGIN RESPONSE
        // ====================================================

        const result =
            await response.json();


        console.log(
            "LOGIN RESPONSE JSON:",
            result
        );


        // ====================================================
        // 401 = PASSWORD REJECTED
        // ====================================================

        if (
            response.status ===
            401
        ) {

            console.error(
                "============================================"
            );

            console.error(
                "BACKEND REJECTED THE PASSWORD"
            );

            console.error(
                "============================================"
            );


            errorElement.textContent =
                result.error ||
                "Incorrect password. Please try again.";


            passwordInput.value = "";

            passwordInput.focus();


            return;
        }


        // ====================================================
        // 403 = DATE GATE / SESSION PROBLEM
        // ====================================================

        if (
            response.status ===
            403
        ) {

            console.error(
                "============================================"
            );

            console.error(
                "LOGIN REJECTED WITH HTTP 403"
            );

            console.error(
                "The date verification/session gate may have failed."
            );

            console.error(
                "============================================"
            );


            errorElement.textContent =
                result.error ||
                "Date verification has expired. Please verify the date again.";


            return;
        }


        // ====================================================
        // 500 = SERVER ERROR
        // ====================================================

        if (
            response.status >=
            500
        ) {

            console.error(
                "============================================"
            );

            console.error(
                "SERVER ERROR DURING LOGIN"
            );

            console.error(
                "============================================"
            );


            errorElement.textContent =
                result.error ||
                "Authentication server error.";


            return;
        }


        // ====================================================
        // GENERAL LOGIN FAILURE
        // ====================================================

        if (
            !response.ok ||
            !result.success
        ) {

            console.error(
                "LOGIN FAILED"
            );


            errorElement.textContent =
                result.error ||
                "Incorrect password. Please try again.";


            passwordInput.value = "";

            passwordInput.focus();


            return;
        }


        // ====================================================
        // PASSWORD ACCEPTED
        // ====================================================

        console.log(
            "============================================"
        );

        console.log(
            "PASSWORD ACCEPTED BY BACKEND"
        );

        console.log(
            "============================================"
        );


        // ====================================================
        // CSRF TOKEN
        // ====================================================

        csrfToken =
            result.csrfToken || "";


        console.log(
            "CSRF token received:",
            csrfToken
                ? "YES"
                : "NO"
        );


        console.log(
            "CSRF token length:",
            csrfToken.length
        );


        if (!csrfToken) {

            console.error(
                "LOGIN SUCCESSFUL BUT CSRF TOKEN IS MISSING."
            );


            errorElement.textContent =
                "Login succeeded but the security token was not received.";


            return;
        }


        // ====================================================
        // CHECK JAVASCRIPT-VISIBLE COOKIES
        // ====================================================

        console.log(
            "Cookies visible to JavaScript AFTER login:",
            document.cookie
        );


        console.log(
            "IMPORTANT: chat_session is expected NOT to appear above because it is HttpOnly."
        );


        // ====================================================
        // MARK AUTHENTICATED
        // ====================================================

        chatAuthenticated = true;


        // ====================================================
        // TEST AUTHENTICATED SESSION
        // BEFORE SHOWING CHAT
        // ====================================================

        console.log(
            "Testing authenticated /messages endpoint..."
        );


        const sessionTestResponse =
            await fetch(
                `${MESSAGES_API}?limit=1`,
                {
                    method: "GET",

                    /*
                     * VERY IMPORTANT:
                     * This sends the HTTP-only session cookie.
                     */
                    credentials: "include",

                    headers: {
                        "Accept":
                            "application/json",

                        "X-CSRF-Token":
                            csrfToken
                    }
                }
            );


        console.log(
            "MESSAGES TEST HTTP STATUS:",
            sessionTestResponse.status
        );


        const sessionTestResult =
            await sessionTestResponse.json();


        console.log(
            "MESSAGES TEST RESPONSE:",
            sessionTestResult
        );


        // ====================================================
        // SESSION FAILED
        // ====================================================

        if (
            sessionTestResponse.status ===
            401
        ) {

            console.error(
                "============================================"
            );

            console.error(
                "SESSION COOKIE WAS NOT ACCEPTED"
            );

            console.error(
                "Password was correct, but backend rejected the session."
            );

            console.error(
                "============================================"
            );


            chatAuthenticated = false;

            csrfToken = "";


            errorElement.textContent =
                "Password accepted, but the secure mobile session could not be established.";


            return;
        }


        // ====================================================
        // CSRF / DATE GATE FAILURE
        // ====================================================

        if (
            sessionTestResponse.status ===
            403
        ) {

            console.error(
                "============================================"
            );

            console.error(
                "SESSION REACHED BACKEND BUT CSRF/DATE CHECK FAILED"
            );

            console.error(
                "============================================"
            );


            chatAuthenticated = false;


            errorElement.textContent =
                sessionTestResult.error ||
                "Security verification failed.";


            return;
        }


        // ====================================================
        // OTHER FAILURE
        // ====================================================

        if (
            !sessionTestResponse.ok ||
            !sessionTestResult.success
        ) {

            console.error(
                "Authenticated session test failed."
            );


            chatAuthenticated = false;


            errorElement.textContent =
                "Secure session could not be verified.";


            return;
        }


        // ====================================================
        // SESSION VERIFIED
        // ====================================================

        console.log(
            "============================================"
        );

        console.log(
            "SESSION VERIFIED SUCCESSFULLY"
        );

        console.log(
            "CHAT AUTHENTICATION COMPLETE"
        );

        console.log(
            "============================================"
        );


        // ====================================================
        // SHOW AUTHENTICATED CHAT
        // ====================================================

        document
            .getElementById(
                "chatPasswordGate"
            )
            .classList.remove(
                "visible"
            );


        document
            .getElementById(
                "authenticatedChat"
            )
            .classList.add(
                "visible"
            );


        if (!chatInitialized) {

            initializeChat();

            chatInitialized = true;
        }


    } catch (error) {

        console.error(
            "============================================"
        );

        console.error(
            "LOGIN REQUEST EXCEPTION"
        );

        console.error(
            error
        );

        console.error(
            "============================================"
        );


        errorElement.textContent =
            "Unable to connect to the authentication server.";


    } finally {

        unlockButton.disabled = false;

        unlockButton.textContent =
            "Unlock Chat";


        console.log(
            "========== LOGIN DEBUG END =========="
        );
    }
}


// ============================================================
// LOAD MESSAGES
// ============================================================

async function loadMessages() {

    if (!chatAuthenticated) {

        return;
    }


    if (!csrfToken) {

        console.error(
            "Cannot load messages: CSRF token missing."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${MESSAGES_API}?limit=50`,
                {
                    method: "GET",

                    /*
                     * Sends HTTP-only chat_session cookie.
                     */
                    credentials: "include",

                    headers: {
                        "Accept":
                            "application/json",

                        "X-CSRF-Token":
                            csrfToken
                    }
                }
            );


        console.log(
            "Messages GET status:",
            response.status
        );


        if (
            response.status ===
            401
        ) {

            console.error(
                "Messages request returned 401."
            );


            handleAuthenticationExpired();

            return;
        }


        if (
            response.status ===
            403
        ) {

            console.error(
                "Messages request returned 403."
            );


            handleAuthenticationExpired();

            return;
        }


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );
        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.error ||
                "Failed to load messages"
            );
        }


        renderMessages(
            result.messages
        );


    } catch (error) {

        console.error(
            "Error loading messages:",
            error
        );


        showChatError(
            "Unable to connect to the chat server."
        );
    }
}


// ============================================================
// RENDER MESSAGES
// ============================================================

function renderMessages(messages) {

    const chat =
        document.getElementById(
            "askme"
        );


    if (!Array.isArray(messages)) {

        return;
    }


    const signature =
        JSON.stringify(messages);


    if (
        signature ===
        lastMessageSignature
    ) {

        return;
    }


    lastMessageSignature =
        signature;


    chat.innerHTML = "";


    messages.forEach(message => {

        const messageElement =
            document.createElement(
                "div"
            );


        messageElement.className =
            "message";


        const userElement =
            document.createElement(
                "div"
            );


        userElement.className =
            "message-user";


        userElement.textContent =
            `${message.username}:`;


        const textElement =
            document.createElement(
                "div"
            );


        textElement.className =
            "message-text";


        /*
         * textContent prevents HTML injection.
         */

        textElement.textContent =
            message.text;


        messageElement.appendChild(
            userElement
        );


        messageElement.appendChild(
            textElement
        );


        chat.appendChild(
            messageElement
        );

    });


    chat.scrollTop =
        chat.scrollHeight;
}


// ============================================================
// POLLING
// ============================================================

function startMessagePolling() {

    stopMessagePolling();


    if (!chatAuthenticated) {

        return;
    }


    loadMessages();


    messagePolling =
        setInterval(
            loadMessages,
            2000
        );
}


function stopMessagePolling() {

    if (messagePolling) {

        clearInterval(
            messagePolling
        );

        messagePolling = null;
    }
}


// ============================================================
// INITIALIZE CHAT
// ============================================================

function initializeChat() {

    document
        .getElementById("askme")
        .innerHTML = "";


    lastMessageSignature = "";


    startMessagePolling();
}


// ============================================================
// SEND MESSAGE
// ============================================================

async function sendMessage(event) {

    event.preventDefault();


    if (!chatAuthenticated) {

        console.warn(
            "Cannot send message: user is not authenticated."
        );

        return;
    }


    if (!csrfToken) {

        console.error(
            "Cannot send message: CSRF token missing."
        );

        return;
    }


    const input =
        document.getElementById(
            "msg"
        );


    const button =
        document.querySelector(
            "#form button"
        );


    const text =
        input.value.trim();


    if (!text) {

        return;
    }


    try {

        button.disabled = true;


        const response =
            await fetch(
                MESSAGES_API,
                {
                    method: "POST",

                    /*
                     * Sends HTTP-only session cookie.
                     */
                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json",

                        "X-CSRF-Token":
                            csrfToken
                    },

                    body: JSON.stringify({
                        text: text
                    })
                }
            );


        console.log(
            "Send message HTTP status:",
            response.status
        );


        if (
            response.status ===
            401
        ) {

            handleAuthenticationExpired();

            return;
        }


        if (
            response.status ===
            403
        ) {

            handleAuthenticationExpired();

            return;
        }


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );
        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.error ||
                "Failed to send message"
            );
        }


        input.value = "";

        input.focus();


        await loadMessages();


    } catch (error) {

        console.error(
            "Error sending message:",
            error
        );


        alert(
            "Unable to send your message. Please try again."
        );


    } finally {

        button.disabled = false;
    }
}


// ============================================================
// LOGOUT / CLOSE CHAT
// ============================================================

async function closeChat() {

    stopMessagePolling();


    try {

        await fetch(
            LOGOUT_API,
            {
                method: "POST",

                credentials: "include",

                headers: {
                    "Accept":
                        "application/json"
                }
            }
        );


        console.log(
            "Logout request completed."
        );


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    } finally {

        chatAuthenticated = false;

        csrfToken = "";


        document.getElementById(
            "dateInput"
        ).value = "";


        document.getElementById(
            "dateError"
        ).textContent = "";


        document.getElementById(
            "chatPassword"
        ).value = "";


        document.getElementById(
            "passwordError"
        ).textContent = "";


        document.getElementById(
            "chatPasswordGate"
        ).classList.remove(
            "visible"
        );


        document.getElementById(
            "authenticatedChat"
        ).classList.remove(
            "visible"
        );


        document.getElementById(
            "askmeContainer"
        ).classList.remove(
            "visible"
        );


        document.getElementById(
            "sapContainer"
        ).style.display =
            "block";


        document.getElementById(
            "askme"
        ).innerHTML = "";


        document.getElementById(
            "msg"
        ).value = "";


        chatInitialized = false;

        lastMessageSignature = "";
    }
}


// ============================================================
// AUTHENTICATION EXPIRED
// ============================================================

function handleAuthenticationExpired() {

    console.error(
        "Authentication/session expired or was rejected."
    );


    chatAuthenticated = false;

    csrfToken = "";


    stopMessagePolling();


    document
        .getElementById(
            "askmeContainer"
        )
        .classList.remove(
            "visible"
        );


    document
        .getElementById(
            "authenticatedChat"
        )
        .classList.remove(
            "visible"
        );


    document
        .getElementById(
            "chatPasswordGate"
        )
        .classList.remove(
            "visible"
        );


    document
        .getElementById(
            "sapContainer"
        )
        .style.display =
            "block";


    document
        .getElementById(
            "dateInput"
        )
        .value = "";


    chatInitialized = false;

    lastMessageSignature = "";


    alert(
        "Your secure chat session has expired. Please enter the date and password again."
    );
}


// ============================================================
// ERROR DISPLAY
// ============================================================

function showChatError(message) {

    const chat =
        document.getElementById(
            "askme"
        );


    chat.innerHTML = "";


    const errorElement =
        document.createElement(
            "div"
        );


    errorElement.className =
        "error-message";


    errorElement.textContent =
        message;


    chat.appendChild(
        errorElement
    );
}


// ============================================================
// PAGE EVENTS
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "Secure chat frontend loaded."
        );


        console.log(
            "Backend API:",
            API_BASE
        );


        loadSapContent();


        document
            .getElementById(
                "verifyDateButton"
            )
            .addEventListener(
                "click",
                verifyDate
            );


        document
            .getElementById(
                "dateInput"
            )
            .addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        event.preventDefault();

                        verifyDate();
                    }
                }
            );


        document
            .getElementById(
                "passwordForm"
            )
            .addEventListener(
                "submit",
                loginToChat
            );


        document
            .getElementById(
                "cancelPasswordBtn"
            )
            .addEventListener(
                "click",
                closeChat
            );


        document
            .getElementById(
                "form"
            )
            .addEventListener(
                "submit",
                sendMessage
            );


        document
            .getElementById(
                "closeaskmeBtn"
            )
            .addEventListener(
                "click",
                closeChat
            );

    }
);