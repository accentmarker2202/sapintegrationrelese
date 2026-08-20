// ============================================================
// API CONFIGURATION
// ============================================================

const BACKEND_URL =
    "https://secure-chat-backend-eight.vercel.app";


const VERIFY_DATE_API =
    `${BACKEND_URL}/api/verify-date`;


const LOGIN_API =
    `${BACKEND_URL}/api/login`;


const MESSAGES_API =
    `${BACKEND_URL}/api/messages`;


const LOGOUT_API =
    `${BACKEND_URL}/api/logout`;


// ============================================================
// APPLICATION STATE
// ============================================================

let chatInitialized =
    false;


let chatAuthenticated =
    false;


let csrfToken =
    "";


let messagePolling =
    null;


let lastMessageSignature =
    "";


// ============================================================
// SAP CONTENT
// ============================================================

function loadSapContent() {

    const sapContent = `

        <h3>Overview:</h3>

        <p>
            The SAP Integration Module provides standardized
            integration capabilities for connecting SAP systems
            with external applications and services.
        </p>


        <h3>Key Features:</h3>

        <p>
            <strong>• Data Integration:</strong>
            Supports reliable exchange of business data between
            SAP and external systems.
        </p>

        <p>
            <strong>• Process Integration:</strong>
            Enables business processes to communicate across
            different applications.
        </p>

        <p>
            <strong>• Standardized Interfaces:</strong>
            Provides consistent integration patterns and
            interfaces.
        </p>


        <h3>Implementation Best Practices:</h3>

        <p>
            <strong>• Plan Before Implementation:</strong>
            Define clear objectives and mapping requirements
            before starting integration projects.
        </p>

        <p>
            <strong>• Ensure Data Quality:</strong>
            Implement validation rules and data cleansing
            processes to maintain data integrity.
        </p>

        <p>
            <strong>• Test Thoroughly:</strong>
            Conduct comprehensive testing including unit tests,
            integration tests, and user acceptance testing.
        </p>

        <p>
            <strong>• Monitor Performance:</strong>
            Continuously monitor integration processes and
            optimize performance for better efficiency.
        </p>

        <p>
            <strong>• Document Everything:</strong>
            Maintain detailed documentation for future
            maintenance.
        </p>


        <h3>Future Trends:</h3>

        <p>
            The SAP Integration Module continues to evolve with
            emerging technologies including AI-powered data
            matching, blockchain for secure transactions,
            IoT device integration, cloud-native architectures,
            and microservices.
        </p>
    `;


    const element =
        document.getElementById(
            "sapText"
        );


    if (element) {

        element.innerHTML =
            sapContent;
    }
}


// ============================================================
// SHOW PASSWORD SCREEN
// ============================================================

function showChatPasswordGate() {

    const chatContainer =
        document.getElementById(
            "askmeContainer"
        );


    const passwordGate =
        document.getElementById(
            "chatPasswordGate"
        );


    const authenticatedChat =
        document.getElementById(
            "authenticatedChat"
        );


    const sapContainer =
        document.getElementById(
            "sapContainer"
        );


    const passwordError =
        document.getElementById(
            "passwordError"
        );


    const passwordInput =
        document.getElementById(
            "chatPassword"
        );


    chatContainer.classList.add(
        "visible"
    );


    passwordGate.classList.add(
        "visible"
    );


    authenticatedChat.classList.remove(
        "visible"
    );


    sapContainer.style.display =
        "none";


    passwordError.textContent =
        "";


    passwordInput.value =
        "";


    setTimeout(
        () => {

            passwordInput.focus();

        },
        150
    );
}


// ============================================================
// VERIFY DATE
//
// IMPORTANT:
//
// getTargetDate() is NOT present here.
//
// The backend calculates today's date - 10 days.
// The backend creates an HttpOnly date_gate cookie.
//
// The frontend only sends the date supplied by the user.
// ============================================================

async function verifyDate() {

    const dateInput =
        document
            .getElementById(
                "dateInput"
            )
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


    dateError.textContent =
        "";


    // ========================================================
    // DATE FORMAT
    // ========================================================

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
            dateInput
        )
    ) {

        dateError.textContent =
            "Please select a valid date.";

        return;
    }


    try {

        button.disabled =
            true;


        button.textContent =
            "Checking...";


        console.log(
            "Verifying date:",
            dateInput
        );


        const response =
            await fetch(

                VERIFY_DATE_API,

                {
                    method:
                        "POST",

                    /*
                     * VERY IMPORTANT.
                     *
                     * The backend creates:
                     *
                     * date_gate=...
                     *
                     * as an HttpOnly cookie.
                     *
                     * The browser must be allowed
                     * to store that cookie.
                     */

                    credentials:
                        "include",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            date:
                                dateInput
                        })
                }
            );


        let result = {};

        try {

            result =
                await response.json();

        } catch (jsonError) {

            console.error(
                "Unable to parse date response:",
                jsonError
            );

        }


        console.log(
            "Date verification response:",
            response.status,
            result
        );


        // ====================================================
        // SUCCESS
        // ====================================================

        if (
            response.ok &&
            result.success === true
        ) {

            /*
             * DO NOT look for result.dateToken.
             *
             * The backend stores the date verification
             * in the HttpOnly date_gate cookie.
             */

            showChatPasswordGate();

            return;
        }


        // ====================================================
        // DATE REJECTED
        // ====================================================

        if (
            response.status ===
            401
        ) {

            dateError.textContent =
                result.error ||
                "The date is not valid.";

            return;
        }


        // ====================================================
        // SERVER ERROR
        // ====================================================

        dateError.textContent =
            result.error ||
            `Unable to verify the date. Server returned ${response.status}.`;


    } catch (error) {

        console.error(
            "Date verification error:",
            error
        );


        dateError.textContent =
            "Unable to connect to the date verification server.";

    } finally {

        button.disabled =
            false;


        button.textContent =
            "Continue";
    }
}


// ============================================================
// PASSWORD LOGIN
//
// IMPORTANT:
//
// There is NO dateToken here.
//
// The backend gets date_gate automatically from
// the HttpOnly cookie created by /api/verify-date.
// ============================================================

async function loginToChat(
    event
) {

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
            "Please enter the password.";

        return;
    }


    errorElement.textContent =
        "";


    unlockButton.disabled =
        true;


    unlockButton.textContent =
        "Checking...";


    try {

        const response =
            await fetch(

                LOGIN_API,

                {
                    method:
                        "POST",

                    /*
                     * Sends the date_gate cookie
                     * to the backend.
                     */

                    credentials:
                        "include",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    /*
                     * ONLY password is sent.
                     *
                     * date_gate is sent automatically
                     * as a cookie.
                     */

                    body:
                        JSON.stringify({

                            password:
                                password
                        })
                }
            );


        let result = {};

        try {

            result =
                await response.json();

        } catch (jsonError) {

            console.error(
                "Unable to parse login response:",
                jsonError
            );

        }


        console.log(
            "Login response:",
            response.status,
            result
        );


        // ====================================================
        // DATE VERIFICATION REQUIRED
        // ====================================================

        if (
            response.status ===
            403
        ) {

            errorElement.textContent =
                result.error ||
                "Date verification is required. Please verify the date again.";

            return;
        }


        // ====================================================
        // INVALID PASSWORD
        // ====================================================

        if (
            response.status ===
            401
        ) {

            errorElement.textContent =
                "Incorrect password. Please try again.";

            passwordInput.value =
                "";

            passwordInput.focus();

            return;
        }


        // ====================================================
        // OTHER ERROR
        // ====================================================

        if (
            !response.ok ||
            result.success !== true
        ) {

            throw new Error(

                result.error ||
                "Unable to unlock chat."
            );
        }


        // ====================================================
        // CSRF TOKEN
        // ====================================================

        csrfToken =
            result.csrfToken ||
            "";


        if (!csrfToken) {

            throw new Error(
                "CSRF token was not returned by the server."
            );
        }


        // ====================================================
        // LOGIN SUCCESS
        // ====================================================

        chatAuthenticated =
            true;


        passwordInput.value =
            "";


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

            chatInitialized =
                true;
        }

    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        errorElement.textContent =
            error.message ||
            "Unable to unlock chat.";

    } finally {

        unlockButton.disabled =
            false;


        unlockButton.textContent =
            "Unlock Chat";
    }
}


// ============================================================
// LOAD CHAT HISTORY
// ============================================================

async function loadMessages() {

    if (!chatAuthenticated) {

        return;
    }


    try {

        const response =
            await fetch(

                `${MESSAGES_API}?limit=50`,

                {
                    method:
                        "GET",

                    credentials:
                        "include",

                    headers: {

                        "Accept":
                            "application/json",

                        "X-CSRF-Token":
                            csrfToken
                    }
                }
            );


        // ====================================================
        // SESSION EXPIRED
        // ====================================================

        if (
            response.status ===
            401 ||
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


        if (
            !result.success
        ) {

            throw new Error(

                result.error ||
                "Failed to load messages."
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

function renderMessages(
    messages
) {

    const chat =
        document.getElementById(
            "askme"
        );


    if (
        !Array.isArray(
            messages
        )
    ) {

        return;
    }


    const signature =
        JSON.stringify(
            messages
        );


    if (
        signature ===
        lastMessageSignature
    ) {

        return;
    }


    lastMessageSignature =
        signature;


    chat.innerHTML =
        "";


    messages.forEach(
        message => {

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
        }
    );


    chat.scrollTop =
        chat.scrollHeight;
}


// ============================================================
// POLLING
// ============================================================

function startMessagePolling() {

    stopMessagePolling();


    loadMessages();


    messagePolling =
        setInterval(

            loadMessages,

            2000
        );
}


function stopMessagePolling() {

    if (
        messagePolling
    ) {

        clearInterval(
            messagePolling
        );


        messagePolling =
            null;
    }
}


// ============================================================
// INITIALIZE CHAT
// ============================================================

function initializeChat() {

    const chat =
        document.getElementById(
            "askme"
        );


    chat.innerHTML =
        "";


    lastMessageSignature =
        "";


    startMessagePolling();
}


// ============================================================
// SEND MESSAGE
// ============================================================

async function sendMessage(
    event
) {

    event.preventDefault();


    if (
        !chatAuthenticated
    ) {

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

        button.disabled =
            true;


        const response =
            await fetch(

                MESSAGES_API,

                {
                    method:
                        "POST",

                    credentials:
                        "include",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json",

                        "X-CSRF-Token":
                            csrfToken
                    },

                    body:
                        JSON.stringify({

                            text:
                                text
                        })
                }
            );


        // ====================================================
        // SESSION EXPIRED
        // ====================================================

        if (
            response.status ===
            401 ||
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


        if (
            !result.success
        ) {

            throw new Error(

                result.error ||
                "Failed to send message."
            );
        }


        input.value =
            "";


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

        button.disabled =
            false;
    }
}


// ============================================================
// CLOSE / LOGOUT
// ============================================================

async function closeChat() {

    stopMessagePolling();


    try {

        await fetch(

            LOGOUT_API,

            {
                method:
                    "POST",

                credentials:
                    "include",

                headers: {

                    "Accept":
                        "application/json"
                }
            }
        );

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    } finally {

        resetChatState();
    }
}


// ============================================================
// RESET CHAT STATE
// ============================================================

function resetChatState() {

    chatAuthenticated =
        false;


    csrfToken =
        "";


    chatInitialized =
        false;


    lastMessageSignature =
        "";


    stopMessagePolling();


    const dateInput =
        document.getElementById(
            "dateInput"
        );


    const dateError =
        document.getElementById(
            "dateError"
        );


    const passwordInput =
        document.getElementById(
            "chatPassword"
        );


    const passwordError =
        document.getElementById(
            "passwordError"
        );


    const passwordGate =
        document.getElementById(
            "chatPasswordGate"
        );


    const authenticatedChat =
        document.getElementById(
            "authenticatedChat"
        );


    const chatContainer =
        document.getElementById(
            "askmeContainer"
        );


    const sapContainer =
        document.getElementById(
            "sapContainer"
        );


    const chat =
        document.getElementById(
            "askme"
        );


    const messageInput =
        document.getElementById(
            "msg"
        );


    if (dateInput) {

        dateInput.value =
            "";
    }


    if (dateError) {

        dateError.textContent =
            "";
    }


    if (passwordInput) {

        passwordInput.value =
            "";
    }


    if (passwordError) {

        passwordError.textContent =
            "";
    }


    if (passwordGate) {

        passwordGate.classList.remove(
            "visible"
        );
    }


    if (authenticatedChat) {

        authenticatedChat.classList.remove(
            "visible"
        );
    }


    if (chatContainer) {

        chatContainer.classList.remove(
            "visible"
        );
    }


    if (sapContainer) {

        sapContainer.style.display =
            "block";
    }


    if (chat) {

        chat.innerHTML =
            "";
    }


    if (messageInput) {

        messageInput.value =
            "";
    }
}


// ============================================================
// AUTHENTICATION EXPIRED
// ============================================================

function handleAuthenticationExpired() {

    resetChatState();


    alert(
        "Your chat session has expired. Please enter the date and password again."
    );
}


// ============================================================
// ERROR
// ============================================================

function showChatError(
    message
) {

    const chat =
        document.getElementById(
            "askme"
        );


    chat.innerHTML =
        "";


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
// EVENTS
// ============================================================

document.addEventListener(

    "DOMContentLoaded",

    () => {

        console.log(
            "Secure chat frontend loaded."
        );


        loadSapContent();


        // ====================================================
        // DATE BUTTON
        // ====================================================

        const verifyButton =
            document.getElementById(
                "verifyDateButton"
            );


        if (verifyButton) {

            verifyButton.addEventListener(
                "click",
                verifyDate
            );
        }


        // ====================================================
        // DATE ENTER KEY
        // ====================================================

        const dateInput =
            document.getElementById(
                "dateInput"
            );


        if (dateInput) {

            dateInput.addEventListener(

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
        }


        // ====================================================
        // PASSWORD FORM
        // ====================================================

        const passwordForm =
            document.getElementById(
                "passwordForm"
            );


        if (passwordForm) {

            passwordForm.addEventListener(
                "submit",
                loginToChat
            );
        }


        // ====================================================
        // CANCEL
        // ====================================================

        const cancelButton =
            document.getElementById(
                "cancelPasswordBtn"
            );


        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                closeChat
            );
        }


        // ====================================================
        // CHAT FORM
        // ====================================================

        const chatForm =
            document.getElementById(
                "form"
            );


        if (chatForm) {

            chatForm.addEventListener(
                "submit",
                sendMessage
            );
        }


        // ====================================================
        // CLOSE CHAT
        // ====================================================

        const closeButton =
            document.getElementById(
                "closeaskmeBtn"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeChat
            );
        }

    }
);