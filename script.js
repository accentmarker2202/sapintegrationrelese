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


/*
 * IMPORTANT:
 *
 * The date token is stored only in memory.
 *
 * It is NOT stored in:
 *
 * - localStorage
 * - sessionStorage
 * - cookies
 *
 * It disappears when the page is refreshed.
 */

let dateVerificationToken =
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

    document
        .getElementById(
            "askmeContainer"
        )
        .classList.add(
            "visible"
        );


    document
        .getElementById(
            "chatPasswordGate"
        )
        .classList.add(
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
            "sapContainer"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "passwordError"
        )
        .textContent =
        "";


    document
        .getElementById(
            "chatPassword"
        )
        .value =
        "";


    setTimeout(
        () => {

            document
                .getElementById(
                    "chatPassword"
                )
                .focus();

        },
        100
    );
}


// ============================================================
// VERIFY DATE
//
// getTargetDate() is NOT present here.
// The backend performs the date calculation.
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
        document
            .getElementById(
                "dateError"
            );


    const button =
        document
            .getElementById(
                "verifyDateButton"
            );


    dateError.textContent =
        "";


    // ========================================================
    // FORMAT
    // ========================================================

    if (
        !/^\d{4}-\d{2}-\d{2}$/
            .test(
                dateInput
            )
    ) {

        dateError.textContent =
            "Please enter the date in YYYY-MM-DD format.";

        return;
    }


    try {

        button.disabled =
            true;


        button.textContent =
            "Checking...";


        const response =
            await fetch(

                VERIFY_DATE_API,

                {
                    method:
                        "POST",

                    /*
                     * Credentials are not required for
                     * date verification anymore because
                     * the date gate is token-based.
                     */

                    credentials:
                        "omit",

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


        const result =
            await response.json();


        if (
            response.ok &&
            result.success &&
            result.dateToken
        ) {

            /*
             * Store only in memory.
             */

            dateVerificationToken =
                result.dateToken;


            showChatPasswordGate();


        } else {

            dateVerificationToken =
                "";


            dateError.textContent =
                result.error ||
                "The date is not valid. Please try again.";
        }


    } catch (error) {

        console.error(
            "Date verification error:",
            error
        );


        dateVerificationToken =
            "";


        dateError.textContent =
            "Unable to verify the date. Please try again.";


    } finally {

        button.disabled =
            false;


        button.textContent =
            "Continue";
    }
}


// ============================================================
// PASSWORD LOGIN
// ============================================================

async function loginToChat(
    event
) {

    event.preventDefault();


    const passwordInput =
        document
            .getElementById(
                "chatPassword"
            );


    const errorElement =
        document
            .getElementById(
                "passwordError"
            );


    const unlockButton =
        document
            .getElementById(
                "unlockButton"
            );


    const password =
        passwordInput.value;


    // ========================================================
    // DATE TOKEN CHECK
    // ========================================================

    if (
        !dateVerificationToken
    ) {

        errorElement.textContent =
            "Date verification is required. Please verify the date again.";

        return;
    }


    // ========================================================
    // PASSWORD CHECK
    // ========================================================

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

                            password:
                                password,

                            dateToken:
                                dateVerificationToken
                        })
                }
            );


        const result =
            await response.json();


        // ====================================================
        // DATE TOKEN EXPIRED
        // ====================================================

        if (
            response.status ===
                403
        ) {

            dateVerificationToken =
                "";


            errorElement.textContent =
                result.error ||
                "Date verification expired. Please verify the date again.";


            return;
        }


        // ====================================================
        // PASSWORD ERROR
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


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(

                result.error ||
                "Unable to unlock chat."
            );
        }


        // ====================================================
        // LOGIN SUCCESS
        // ====================================================

        csrfToken =
            result.csrfToken ||
            "";


        if (!csrfToken) {

            throw new Error(
                "CSRF token was not returned by the server."
            );
        }


        chatAuthenticated =
            true;


        /*
         * Date token is no longer needed after login.
         */

        dateVerificationToken =
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


        passwordInput.value =
            "";


        if (
            !chatInitialized
        ) {

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

    if (
        !chatAuthenticated
    ) {

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


        if (
            !response.ok
        ) {

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

    document
        .getElementById(
            "askme"
        )
        .innerHTML =
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


        if (
            response.status ===
                401 ||
            response.status ===
                403
        ) {

            handleAuthenticationExpired();

            return;
        }


        if (
            !response.ok
        ) {

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


    dateVerificationToken =
        "";


    chatInitialized =
        false;


    lastMessageSignature =
        "";


    stopMessagePolling();


    document
        .getElementById(
            "dateInput"
        )
        .value =
        "";


    document
        .getElementById(
            "dateError"
        )
        .textContent =
        "";


    document
        .getElementById(
            "chatPassword"
        )
        .value =
        "";


    document
        .getElementById(
            "passwordError"
        )
        .textContent =
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
        .classList.remove(
            "visible"
        );


    document
        .getElementById(
            "askmeContainer"
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
            "askme"
        )
        .innerHTML =
        "";


    document
        .getElementById(
            "msg"
        )
        .value =
        "";
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