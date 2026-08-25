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
// CHAT STATE
// ============================================================

let chatInitialized = false;

let messagePolling = null;

let lastMessageSignature = "";


// ============================================================
// IMAGE CONFIGURATION
// ============================================================

const MAX_IMAGE_SIZE =
    5 * 1024 * 1024; // 5 MB


const ALLOWED_IMAGE_TYPES = [

    "image/jpeg",

    "image/png",

    "image/gif",

    "image/webp"
];


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


    const sapText =
        document.getElementById(
            "sapText"
        );


    if (sapText) {

        sapText.innerHTML =
            sapContent;
    }
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
        .style.display =
        "none";


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

                    method:
                        "POST",

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

                    method:
                        "POST",

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


    try {

        console.log(
            "Loading messages from backend..."
        );


        const response =
            await fetch(
                `${MESSAGES_API}?limit=50`,
                {

                    method:
                        "GET",

                    headers: {

                        "Accept":
                            "application/json",

                        "Authorization":
                            `Bearer ${sessionToken}`
                    }
                }
            );


        console.log(
            "Messages API status:",
            response.status
        );


        const responseText =
            await response.text();


        console.log(
            "Messages API response:",
            responseText
        );


        let result;


        try {

            result =
                JSON.parse(
                    responseText
                );

        } catch (jsonError) {

            console.error(
                "Unable to parse messages response:",
                jsonError
            );


            throw new Error(
                "Server returned an invalid response."
            );
        }


        // ====================================================
        // AUTHENTICATION EXPIRED
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

            throw new Error(
                result.error ||
                `Server returned ${response.status}`
            );
        }


        // ====================================================
        // SUCCESS
        // ====================================================

        if (
            !result.success
        ) {

            throw new Error(
                result.error ||
                "Failed to load messages."
            );
        }


        // ====================================================
        // MESSAGE ARRAY
        // ====================================================

        if (
            !Array.isArray(
                result.messages
            )
        ) {

            throw new Error(
                "Invalid messages data received from server."
            );
        }


        console.log(
            "Messages received from Firebase:",
            result.messages.length
        );


        renderMessages(
            result.messages
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


    if (!chat) {
        return;
    }


    if (!Array.isArray(messages)) {
        return;
    }


    // ========================================================
    // IMPORTANT:
    // Prevent unnecessary redraws.
    // ========================================================

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


    chat.innerHTML = "";


    messages.forEach(
        message => {

            const messageElement =
                document.createElement(
                    "div"
                );


            messageElement.className =
                "message";


            // =================================================
            // USERNAME
            // =================================================

            const userElement =
                document.createElement(
                    "div"
                );


            userElement.className =
                "message-user";


            userElement.textContent =
                `${message.username || "Unknown"}:`;


            messageElement.appendChild(
                userElement
            );


            // =================================================
            // IMAGE MESSAGE
            // =================================================

            if (
                message.type === "image" &&
                message.image &&
                message.image.dataUrl
            ) {

                const imageContainer =
                    document.createElement(
                        "div"
                    );


                imageContainer.className =
                    "chat-image-container";


                const imageElement =
                    document.createElement(
                        "img"
                    );


                imageElement.className =
                    "chat-image";


                imageElement.src =
                    message.image.dataUrl;


                imageElement.alt =
                    message.image.originalName ||
                    "Chat image";


                imageElement.loading =
                    "lazy";


                imageElement.decoding =
                    "async";


                imageElement.addEventListener(
                    "click",
                    () => {

                        openImageViewer(
                            message.image.dataUrl
                        );

                    }
                );


                imageContainer.appendChild(
                    imageElement
                );


                messageElement.appendChild(
                    imageContainer
                );


                // Optional caption

                if (
                    message.text
                ) {

                    const caption =
                        document.createElement(
                            "div"
                        );


                    caption.className =
                        "message-text";


                    caption.textContent =
                        message.text;


                    messageElement.appendChild(
                        caption
                    );
                }


            } else {

                // =============================================
                // NORMAL TEXT MESSAGE
                // =============================================

                const textElement =
                    document.createElement(
                        "div"
                    );


                textElement.className =
                    "message-text";


                textElement.textContent =
                    message.text || "";


                messageElement.appendChild(
                    textElement
                );
            }


            // =================================================
            // ADD TO CHAT
            // =================================================

            chat.appendChild(
                messageElement
            );

        }
    );


    chat.scrollTop =
        chat.scrollHeight;
}


// ============================================================
// IMAGE VIEWER
// ============================================================

function openImageViewer(
    dataUrl
) {

    if (!dataUrl) {
        return;
    }


    const overlay =
        document.createElement(
            "div"
        );


    overlay.className =
        "image-viewer-overlay";


    const image =
        document.createElement(
            "img"
        );


    image.className =
        "image-viewer-image";


    image.src =
        dataUrl;


    image.alt =
        "Chat image";


    overlay.appendChild(
        image
    );


    overlay.addEventListener(
        "click",
        () => {

            overlay.remove();

        }
    );


    document.body.appendChild(
        overlay
    );
}


// ============================================================
// IMAGE UPLOAD
// ============================================================

async function uploadImage(
    file
) {

    if (
        !chatAuthenticated ||
        !sessionToken
    ) {

        alert(
            "Please login to the chat first."
        );

        return;
    }


    if (!file) {
        return;
    }


    // ========================================================
    // FILE TYPE CHECK
    // ========================================================

    if (
        !ALLOWED_IMAGE_TYPES.includes(
            file.type
        )
    ) {

        alert(
            "Please select a JPG, PNG, GIF, or WebP image."
        );

        return;
    }


    // ========================================================
    // FILE SIZE CHECK
    // ========================================================

    if (
        file.size >
        MAX_IMAGE_SIZE
    ) {

        alert(
            "Image is too large. Maximum size is 5 MB."
        );

        return;
    }


    const photoButton =
        document.getElementById(
            "photoButton"
        );


    if (photoButton) {

        photoButton.disabled =
            true;

        photoButton.textContent =
            "Uploading...";
    }


    try {

        console.log(
            "Uploading image:",
            file.name,
            file.type,
            file.size
        );


        // ====================================================
        // MULTIPART FORM DATA
        //
        // DO NOT manually set Content-Type.
        // Browser automatically adds the multipart boundary.
        // ====================================================

        const formData =
            new FormData();


        formData.append(
            "image",
            file,
            file.name
        );


        const response =
            await fetch(
                MESSAGES_API,
                {

                    method:
                        "POST",

                    headers: {

                        "Authorization":
                            `Bearer ${sessionToken}`,

                        "Accept":
                            "application/json"
                    },

                    body:
                        formData
                }
            );


        const responseText =
            await response.text();


        console.log(
            "Image upload response:",
            response.status,
            responseText
        );


        let result;


        try {

            result =
                JSON.parse(
                    responseText
                );

        } catch (jsonError) {

            throw new Error(
                "Server returned an invalid response."
            );
        }


        // ====================================================
        // AUTHENTICATION EXPIRED
        // ====================================================

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            handleAuthenticationExpired();

            return;
        }


        // ====================================================
        // SERVER ERROR
        // ====================================================

        if (!response.ok) {

            throw new Error(
                result.error ||
                `Server returned ${response.status}`
            );
        }


        // ====================================================
        // APPLICATION ERROR
        // ====================================================

        if (
            !result.success
        ) {

            throw new Error(
                result.error ||
                "Unable to upload image."
            );
        }


        console.log(
            "Image uploaded successfully."
        );


        // ====================================================
        // REFRESH CHAT
        // ====================================================

        await loadMessages();


    } catch (error) {

        console.error(
            "Image upload error:",
            error
        );


        alert(
            error.message ||
            "Unable to upload image. Please try again."
        );


    } finally {

        if (photoButton) {

            photoButton.disabled =
                false;

            photoButton.textContent =
                "📷";
        }
    }
}


// ============================================================
// SEND TEXT MESSAGE
// ============================================================

async function sendMessage(event) {

    event.preventDefault();


    if (
        !chatAuthenticated ||
        !sessionToken
    ) {

        console.error(
            "Cannot send message: user is not authenticated."
        );

        return;
    }


    const input =
        document.getElementById(
            "msg"
        );


    const button =
        document.querySelector(
            "#form button[type='submit']"
        );


    if (!input || !button) {

        console.error(
            "Message input or send button was not found."
        );

        return;
    }


    const text =
        input.value.trim();


    if (!text) {
        return;
    }


    if (
        text.length >
        2000
    ) {

        alert(
            "Message is too long. Maximum 2000 characters."
        );

        return;
    }


    button.disabled =
        true;


    const originalButtonText =
        button.textContent;


    button.textContent =
        "Sending...";


    try {

        const response =
            await fetch(
                MESSAGES_API,
                {

                    method:
                        "POST",

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


        const responseText =
            await response.text();


        let result;


        try {

            result =
                JSON.parse(
                    responseText
                );

        } catch (jsonError) {

            throw new Error(
                "Server returned an invalid response."
            );
        }


        // ====================================================
        // SESSION EXPIRED
        // ====================================================

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            handleAuthenticationExpired();

            return;
        }


        // ====================================================
        // SERVER ERROR
        // ====================================================

        if (!response.ok) {

            throw new Error(
                result.error ||
                `Server returned ${response.status}`
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
                result.error ||
                "Unable to send message."
            );
        }


        console.log(
            "Message sent successfully."
        );


        input.value = "";


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

        button.disabled =
            false;

        button.textContent =
            originalButtonText ||
            "Send";
    }
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

    if (messagePolling) {

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


    if (chat) {

        chat.innerHTML =
            "";
    }


    lastMessageSignature =
        "";


    startMessagePolling();
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

                method:
                    "POST",

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

        chatAuthenticated =
            false;


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


        const imageInput =
            document.getElementById(
                "imageInput"
            );


        if (imageInput) {

            imageInput.value =
                "";
        }


        chatInitialized =
            false;


        lastMessageSignature =
            "";
    }
}


// ============================================================
// AUTHENTICATION EXPIRED
// ============================================================

function handleAuthenticationExpired() {

    chatAuthenticated =
        false;


    sessionToken =
        "";


    csrfToken =
        "";


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
    ).style.display =
        "block";


    document.getElementById(
        "dateInput"
    ).value = "";


    chatInitialized =
        false;


    lastMessageSignature =
        "";


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


    if (!chat) {
        return;
    }


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
// IMAGE BUTTON SETUP
// ============================================================

function initializeImageUpload() {

    const photoButton =
        document.getElementById(
            "photoButton"
        );


    const imageInput =
        document.getElementById(
            "imageInput"
        );


    if (
        !photoButton ||
        !imageInput
    ) {

        console.warn(
            "Photo upload elements were not found."
        );

        return;
    }


    // ========================================================
    // OPEN FILE SELECTOR
    // ========================================================

    photoButton.addEventListener(
        "click",
        () => {

            if (
                !chatAuthenticated
            ) {

                alert(
                    "Please login to the chat first."
                );

                return;
            }


            imageInput.click();

        }
    );


    // ========================================================
    // FILE SELECTED
    // ========================================================

    imageInput.addEventListener(
        "change",
        async () => {

            const file =
                imageInput.files &&
                imageInput.files[0];


            if (!file) {
                return;
            }


            await uploadImage(
                file
            );


            // Allow selecting the same file again.
            imageInput.value =
                "";
        }
    );
}


// ============================================================
// PAGE EVENTS
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadSapContent();


        // ====================================================
        // DATE
        // ====================================================

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


        // ====================================================
        // PASSWORD
        // ====================================================

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


        // ====================================================
        // TEXT MESSAGE
        // ====================================================

        document
            .getElementById(
                "form"
            )
            .addEventListener(
                "submit",
                sendMessage
            );


        // ====================================================
        // PHOTO UPLOAD
        // ====================================================

        initializeImageUpload();


        // ====================================================
        // CLOSE CHAT
        // ====================================================

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