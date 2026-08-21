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
// AUTHENTICATION STATE
// ============================================================

let dateToken = "";

let sessionToken = "";

let csrfToken = "";

let chatAuthenticated = false;


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
//
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


        const response =
            await fetch(
                VERIFY_DATE_API,
                {
                    method: "POST",

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


        const result =
            await response.json();


        console.log(
            "Date verification:",
            response.status,
            result
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.error ||
                "Invalid date."
            );
        }


        dateToken =
            result.dateToken;


        if (!dateToken) {

            throw new Error(
                "Server did not return a date token."
            );
        }


        showChatPasswordGate();


    } catch (error) {

        console.error(
            "Date verification error:",
            error
        );


        dateError.textContent =
            error.message ||
            "Unable to verify the date. Please try again.";


    } finally {

        button.disabled = false;

        button.textContent =
            "Continue";
    }
}


// ============================================================
// PASSWORD LOGIN
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


    const password =
        passwordInput.value;


    if (!password) {

        errorElement.textContent =
            "Please enter your password.";

        return;
    }


    if (!dateToken) {

        errorElement.textContent =
            "Date verification has expired. Please verify the date again.";

        return;
    }


    errorElement.textContent = "";

    unlockButton.disabled = true;

    unlockButton.textContent =
        "Checking...";


    try {

        const response =
            await fetch(
                LOGIN_API,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body: JSON.stringify({

                        password:
                            password,

                        dateToken:
                            dateToken
                    })
                }
            );


        const result =
            await response.json();


        console.log(
            "Login:",
            response.status,
            result.success
        );


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.error ||
                "Invalid password."
            );
        }


        sessionToken =
            result.sessionToken;


        csrfToken =
            result.csrfToken || "";


        if (!sessionToken) {

            throw new Error(
                "Server did not return a session token."
            );
        }


        dateToken = "";

        chatAuthenticated = true;


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
            "Login error:",
            error
        );


        errorElement.textContent =
            error.message ||
            "Incorrect password. Please try again.";


        passwordInput.value = "";

        passwordInput.focus();


    } finally {

        unlockButton.disabled = false;

        unlockButton.textContent =
            "Unlock Chat";
    }
}


// ============================================================
// LOAD MESSAGES
// ============================================================

async function loadMessages() {

    if (!chatAuthenticated) {

        console.log(
            "loadMessages: User is not authenticated."
        );

        return;
    }


    if (!sessionToken) {

        console.error(
            "loadMessages: sessionToken is missing."
        );

        showChatError(
            "Chat session is missing. Please login again."
        );

        return;
    }


    const chat =
        document.getElementById("askme");


    if (!chat) {

        console.error(
            "CRITICAL: #askme element was not found."
        );

        return;
    }


    try {

        console.log(
            "=========================================="
        );

        console.log(
            "LOADING CHAT MESSAGES"
        );

        console.log(
            "=========================================="
        );


        console.log(
            "Messages API:",
            MESSAGES_API
        );


        console.log(
            "Authenticated:",
            chatAuthenticated
        );


        console.log(
            "Session token exists:",
            Boolean(sessionToken)
        );


        // ====================================================
        // REQUEST
        // ====================================================

        const response =
            await fetch(
                `${MESSAGES_API}?limit=50`,
                {
                    method: "GET",

                    headers: {

                        "Accept":
                            "application/json",

                        "Authorization":
                            `Bearer ${sessionToken}`
                    }
                }
            );


        console.log(
            "Messages HTTP status:",
            response.status
        );


        // ====================================================
        // READ RESPONSE AS TEXT FIRST
        // ====================================================

        const responseText =
            await response.text();


        console.log(
            "Messages raw response:",
            responseText
        );


        let result;


        try {

            result =
                JSON.parse(
                    responseText
                );

        } catch (error) {

            console.error(
                "Messages response is not valid JSON:",
                error
            );


            throw new Error(
                "The server returned an invalid response."
            );
        }


        console.log(
            "Messages parsed response:",
            result
        );


        // ====================================================
        // AUTHENTICATION FAILURE
        // ====================================================

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            console.error(
                "Messages authentication failed:",
                result
            );


            handleAuthenticationExpired();

            return;
        }


        // ====================================================
        // SERVER ERROR
        // ====================================================

        if (!response.ok) {

            console.error(
                "Messages API returned an error:",
                response.status,
                result
            );


            throw new Error(
                result &&
                result.error

                    ? result.error

                    : `Server returned HTTP ${response.status}.`
            );
        }


        // ====================================================
        // SUCCESS CHECK
        // ====================================================

        if (
            !result ||
            result.success !== true
        ) {

            console.error(
                "Messages API reported failure:",
                result
            );


            throw new Error(
                result &&
                result.error

                    ? result.error

                    : "The server did not return successful message data."
            );
        }


        // ====================================================
        // MESSAGE ARRAY CHECK
        // ====================================================

        if (
            !Array.isArray(
                result.messages
            )
        ) {

            console.error(
                "Messages property is not an array:",
                result
            );


            throw new Error(
                "Invalid message data received from the server."
            );
        }


        console.log(
            "Messages received:",
            result.messages.length
        );


        // ====================================================
        // RENDER
        // ====================================================

        try {

            renderMessages(
                result.messages
            );

        } catch (renderError) {

            console.error(
                "=========================================="
            );

            console.error(
                "MESSAGE RENDERING ERROR"
            );

            console.error(
                "=========================================="
            );

            console.error(
                renderError
            );


            throw new Error(
                "Messages were received but could not be displayed."
            );
        }


        console.log(
            "Messages rendered successfully."
        );


        console.log(
            "=========================================="
        );


    } catch (error) {

        console.error(
            "=========================================="
        );

        console.error(
            "LOAD MESSAGES ERROR"
        );

        console.error(
            "=========================================="
        );

        console.error(
            error
        );


        showChatError(
            error.message ||
            "Unable to load chat messages."
        );
    }
}

// ============================================================
// RENDER MESSAGES
// ============================================================

function renderMessages(messages) {

    console.log(
        "renderMessages() started."
    );


    // ========================================================
    // FIND CHAT CONTAINER
    // ========================================================

    const chat =
        document.getElementById(
            "askme"
        );


    if (!chat) {

        throw new Error(
            "Chat message container #askme was not found in the HTML."
        );
    }


    // ========================================================
    // VALIDATE ARRAY
    // ========================================================

    if (
        !Array.isArray(messages)
    ) {

        throw new Error(
            "Messages data is not an array."
        );
    }


    console.log(
        "Rendering",
        messages.length,
        "messages."
    );


    // ========================================================
    // CREATE SIGNATURE
    // ========================================================

    let signature;


    try {

        signature =
            JSON.stringify(
                messages
            );

    } catch (error) {

        console.error(
            "Unable to create message signature:",
            error
        );

        signature =
            "";
    }


    // ========================================================
    // DON'T RE-RENDER IDENTICAL DATA
    // ========================================================

    if (
        typeof lastMessageSignature !==
        "undefined" &&

        signature ===
        lastMessageSignature
    ) {

        console.log(
            "Messages have not changed. No re-render needed."
        );

        return;
    }


    lastMessageSignature =
        signature;


    // ========================================================
    // CLEAR CHAT
    // ========================================================

    chat.innerHTML = "";


    // ========================================================
    // EMPTY DATABASE
    // ========================================================

    if (
        messages.length === 0
    ) {

        const emptyElement =
            document.createElement(
                "div"
            );


        emptyElement.className =
            "empty-chat-message";


        emptyElement.textContent =
            "No messages yet.";


        chat.appendChild(
            emptyElement
        );


        return;
    }


    // ========================================================
    // RENDER EACH MESSAGE
    // ========================================================

    messages.forEach(
        (message, index) => {

            try {

                const messageElement =
                    document.createElement(
                        "div"
                    );


                messageElement.className =
                    "message";


                // ==================================================
                // USERNAME
                // ==================================================

                const userElement =
                    document.createElement(
                        "div"
                    );


                userElement.className =
                    "message-user";


                const username =
                    message &&
                    typeof message.username ===
                    "string"

                        ? message.username

                        : "Unknown";


                userElement.textContent =
                    `${username}:`;


                // ==================================================
                // MESSAGE TEXT
                // ==================================================

                const textElement =
                    document.createElement(
                        "div"
                    );


                textElement.className =
                    "message-text";


                const text =
                    message &&
                    typeof message.text ===
                    "string"

                        ? message.text

                        : "";


                /*
                 * textContent is deliberately used instead
                 * of innerHTML for security.
                 */

                textElement.textContent =
                    text;


                // ==================================================
                // APPEND
                // ==================================================

                messageElement.appendChild(
                    userElement
                );


                messageElement.appendChild(
                    textElement
                );


                chat.appendChild(
                    messageElement
                );


            } catch (error) {

                console.error(
                    "Unable to render message:",
                    index,
                    message,
                    error
                );
            }

        }
    );


    // ========================================================
    // SCROLL TO BOTTOM
    // ========================================================

    chat.scrollTop =
        chat.scrollHeight;


    console.log(
        "Chat DOM updated successfully."
    );
}


// ============================================================
// POLLING
// ============================================================

function startMessagePolling() {

    stopMessagePolling();


    console.log(
        "Starting message polling."
    );


    loadMessages();


    messagePolling =
        setInterval(
            () => {

                if (
                    chatAuthenticated &&
                    sessionToken
                ) {

                    loadMessages();

                } else {

                    stopMessagePolling();
                }

            },
            2000
        );
}


// ============================================================
// STOP POLLING
// ============================================================

function stopMessagePolling() {

    if (
        messagePolling
    ) {

        clearInterval(
            messagePolling
        );


        messagePolling =
            null;


        console.log(
            "Message polling stopped."
        );
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

// ============================================================
// SEND MESSAGE
// ============================================================

async function sendMessage(event) {

    event.preventDefault();


    // ========================================================
    // AUTHENTICATION CHECK
    // ========================================================

    if (
        !chatAuthenticated ||
        !sessionToken
    ) {

        console.error(
            "Cannot send message: user is not authenticated."
        );

        return;
    }


    // ========================================================
    // GET ELEMENTS
    // ========================================================

    const input =
        document.getElementById(
            "msg"
        );


    const button =
        document.querySelector(
            "#form button"
        );


    if (!input || !button) {

        console.error(
            "Message input or send button was not found."
        );

        return;
    }


    // ========================================================
    // READ MESSAGE
    // ========================================================

    const text =
        input.value.trim();


    // ========================================================
    // EMPTY MESSAGE CHECK
    // ========================================================

    if (!text) {

        return;
    }


    // ========================================================
    // MESSAGE LENGTH CHECK
    // ========================================================

    if (
        text.length >
        2000
    ) {

        alert(
            "Message is too long. Maximum 2000 characters."
        );

        return;
    }


    // ========================================================
    // DISABLE BUTTON
    // ========================================================

    button.disabled = true;


    const originalButtonText =
        button.textContent;


    button.textContent =
        "Sending...";


    try {

        // ====================================================
        // SEND TO VERCEL
        //
        // Authentication is now:
        //
        // Authorization:
        // Bearer <sessionToken>
        //
        // NO COOKIES
        // NO credentials: include
        // NO X-CSRF-Token
        // ====================================================

        const response =
            await fetch(
                MESSAGES_API,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json",

                        "Authorization":
                            `Bearer ${sessionToken}`
                    },

                    body:
                        JSON.stringify({

                            text:
                                text
                        })
                }
            );


        // ====================================================
        // READ SERVER RESPONSE
        // ====================================================

        let result = null;


        try {

            result =
                await response.json();

        } catch (jsonError) {

            console.error(
                "Server returned an invalid JSON response:",
                jsonError
            );
        }


        // ====================================================
        // SESSION EXPIRED
        // ====================================================

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            console.error(
                "Authentication expired or rejected."
            );


            handleAuthenticationExpired();

            return;
        }


        // ====================================================
        // SERVER ERROR
        // ====================================================

        if (!response.ok) {

            console.error(
                "Send message failed:",
                response.status,
                result
            );


            throw new Error(

                result &&
                result.error

                    ? result.error

                    : `Server returned ${response.status}`
            );
        }


        // ====================================================
        // APPLICATION ERROR
        // ====================================================

        if (
            !result ||
            !result.success
        ) {

            throw new Error(

                result &&
                result.error

                    ? result.error

                    : "Unable to send message."
            );
        }


        // ====================================================
        // SUCCESS
        // ====================================================

        console.log(
            "Message sent successfully."
        );


        // Clear input

        input.value = "";


        // Put cursor back in input

        input.focus();


        // ====================================================
        // REFRESH CHAT
        // ====================================================

        await loadMessages();


    } catch (error) {

        console.error(
            "Error sending message:",
            error
        );


        alert(
            error.message ||
            "Unable to send your message. Please try again."
        );


    } finally {

        // ====================================================
        // RE-ENABLE BUTTON
        // ====================================================

        button.disabled = false;

        button.textContent =
            originalButtonText ||
            "Send";
    }
}

// ============================================================
// LOGOUT
// ============================================================

async function closeChat() {

    stopMessagePolling();


    try {

        await fetch(
            LOGOUT_API,
            {
                method: "POST",

                headers: {
                    "Accept":
                        "application/json",

                    "Authorization":
                        sessionToken
                            ? `Bearer ${sessionToken}`
                            : ""
                }
            }
        );

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    } finally {

        dateToken = "";

        sessionToken = "";

        csrfToken = "";

        chatAuthenticated = false;


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

    chatAuthenticated = false;

    csrfToken = "";


    stopMessagePolling();


    document.getElementById(
        "askmeContainer"
    ).classList.remove(
        "visible"
    );


    document.getElementById(
        "authenticatedChat"
    ).classList.remove(
        "visible"
    );


    document.getElementById(
        "chatPasswordGate"
    ).classList.remove(
        "visible"
    );


    document.getElementById(
        "sapContainer"
    ).style.display = "block";


    document.getElementById(
        "dateInput"
    ).value = "";


    chatInitialized = false;

    lastMessageSignature = "";


    alert(
        "Your chat session has expired. Please enter the date and password again."
    );
}


// ============================================================
// ERROR
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