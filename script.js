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
//
// IMPORTANT:
//
// messages.js currently allows a maximum of 750 KB.
// Keep the frontend limit the same.
// ============================================================

const MAX_IMAGE_SIZE =
    750 * 1024;


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

    const askmeContainer =
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


    if (askmeContainer) {

        askmeContainer.classList.add(
            "visible"
        );
    }


    if (passwordGate) {

        passwordGate.classList.add(
            "visible"
        );
    }


    if (authenticatedChat) {

        authenticatedChat.classList.remove(
            "visible"
        );
    }


    if (sapContainer) {

        sapContainer.style.display =
            "none";
    }


    const passwordError =
        document.getElementById(
            "passwordError"
        );


    if (passwordError) {

        passwordError.textContent =
            "";
    }


    const password =
        document.getElementById(
            "chatPassword"
        );


    if (password) {

        password.value =
            "";

        setTimeout(() => {

            password.focus();

        }, 100);
    }
}


// ============================================================
// VERIFY DATE
//
// The target date is calculated ONLY by Vercel.
// ============================================================

async function verifyDate() {

    const dateInputElement =
        document.getElementById(
            "dateInput"
        );


    const dateError =
        document.getElementById(
            "dateError"
        );


    const button =
        document.getElementById(
            "verifyDateButton"
        );


    if (
        !dateInputElement ||
        !dateError ||
        !button
    ) {

        console.error(
            "Date verification elements were not found."
        );

        return;
    }


    const dateInput =
        dateInputElement.value.trim();


    dateError.textContent =
        "";


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


        const responseText =
            await response.text();


        let result;


        try {

            result =
                JSON.parse(
                    responseText
                );

        } catch (jsonError) {

            console.error(
                "Date response is not valid JSON:",
                responseText
            );

            throw new Error(
                "Server returned an invalid response."
            );
        }


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
            result.dateToken || "";


        /*
         * Some versions of the backend return the date
         * gate as a token, while the newer authentication
         * design may use server-side validation.
         */

        if (!dateToken) {

            /*
             * Keep compatibility with the current frontend.
             * If your verify-date endpoint does not return
             * dateToken, login will tell us clearly.
             */

            console.warn(
                "Server did not return dateToken."
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

        button.disabled =
            false;


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


    if (
        !passwordInput ||
        !errorElement ||
        !unlockButton
    ) {

        console.error(
            "Password login elements were not found."
        );

        return;
    }


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


        const responseText =
            await response.text();


        let result;


        try {

            result =
                JSON.parse(
                    responseText
                );

        } catch (jsonError) {

            console.error(
                "Login response is not valid JSON:",
                responseText
            );

            throw new Error(
                "Server returned an invalid response."
            );
        }


        console.log(
            "Login:",
            response.status,
            result
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
            result.sessionToken || "";


        csrfToken =
            result.csrfToken || "";


        if (!sessionToken) {

            throw new Error(
                "Server did not return a session token."
            );
        }


        dateToken =
            "";


        chatAuthenticated =
            true;


        const passwordGate =
            document.getElementById(
                "chatPasswordGate"
            );


        const authenticatedChat =
            document.getElementById(
                "authenticatedChat"
            );


        if (passwordGate) {

            passwordGate.classList.remove(
                "visible"
            );
        }


        if (authenticatedChat) {

            authenticatedChat.classList.add(
                "visible"
            );
        }


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
            "Incorrect password. Please try again.";


        passwordInput.value =
            "";


        passwordInput.focus();


    } finally {

        unlockButton.disabled =
            false;


        unlockButton.textContent =
            "Unlock Chat";
    }
}


// ============================================================
// LOAD MESSAGES
// ============================================================

async function loadMessages() {

    if (!chatAuthenticated) {

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
        document.getElementById(
            "askme"
        );


    if (!chat) {

        console.error(
            "Chat container #askme was not found."
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

            throw new Error(
                "Server returned an invalid response."
            );
        }


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            handleAuthenticationExpired();

            return;
        }


        if (!response.ok) {

            throw new Error(
                result.error ||
                `Server returned ${response.status}`
            );
        }


        if (
            !result ||
            result.success !== true
        ) {

            throw new Error(
                result.error ||
                "Failed to load messages."
            );
        }


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


        /*
         * Do not replace already displayed messages
         * with an error during a temporary polling failure.
         */

        if (!chat.querySelector(".message")) {

            showChatError(
                error.message ||
                "Unable to connect to the chat server."
            );
        }
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

        throw new Error(
            "Chat container #askme was not found."
        );
    }


    if (!Array.isArray(messages)) {

        throw new Error(
            "Messages data is not an array."
        );
    }


    /*
     * IMPORTANT:
     *
     * The image messages returned by your current
     * messages.js contain:
     *
     * type
     * imageId
     * mimeType
     *
     * They do NOT contain image data.
     *
     * Therefore we fetch each image separately
     * from:
     *
     * /api/messages?imageId=...
     *
     * with the Authorization header.
     */

    let signature;


    try {

        signature =
            JSON.stringify(
                messages
            );

    } catch (error) {

        signature =
            "";
    }


    if (
        signature &&
        signature ===
        lastMessageSignature
    ) {

        return;
    }


    lastMessageSignature =
        signature;


    chat.innerHTML =
        "";


    if (
        messages.length === 0
    ) {

        const emptyElement =
            document.createElement(
                "div"
            );


        emptyElement.className =
            "loading";


        emptyElement.textContent =
            "No messages yet.";


        chat.appendChild(
            emptyElement
        );


        return;
    }


    messages.forEach(
        message => {

            if (!message) {
                return;
            }


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
                message.type ===
                "image"
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


                imageElement.alt =
                    "Chat image";


                imageElement.loading =
                    "lazy";


                imageElement.decoding =
                    "async";


                imageElement.style.display =
                    "none";


                imageContainer.appendChild(
                    imageElement
                );


                /*
                 * Loading indicator while Vercel
                 * decrypts the image.
                 */

                const loadingElement =
                    document.createElement(
                        "div"
                    );


                loadingElement.className =
                    "loading";


                loadingElement.textContent =
                    "Loading image...";


                imageContainer.appendChild(
                    loadingElement
                );


                messageElement.appendChild(
                    imageContainer
                );


                chat.appendChild(
                    messageElement
                );


                /*
                 * Fetch encrypted image through Vercel.
                 *
                 * The Authorization header is important.
                 *
                 * The browser never receives the
                 * IMAGE_ENCRYPTION_KEY.
                 */

                loadChatImage(
                    message.imageId,
                    message.mimeType,
                    imageElement,
                    loadingElement
                );


                return;
            }


            // =================================================
            // TEXT MESSAGE
            // =================================================

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
                message.text || "";


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
// LOAD / DECRYPT IMAGE FROM SERVER
// ============================================================

async function loadChatImage(
    imageId,
    mimeType,
    imageElement,
    loadingElement
) {

    if (
        !imageId ||
        !sessionToken
    ) {

        if (loadingElement) {

            loadingElement.textContent =
                "Unable to load image.";
        }

        return;
    }


    try {

        console.log(
            "Loading encrypted image:",
            imageId
        );


        const response =
            await fetch(
                `${MESSAGES_API}?imageId=${encodeURIComponent(imageId)}`,
                {

                    method:
                        "GET",

                    headers: {

                        "Accept":
                            mimeType ||
                            "image/*",

                        "Authorization":
                            `Bearer ${sessionToken}`
                    },

                    cache:
                        "no-store"
                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            handleAuthenticationExpired();

            return;
        }


        if (!response.ok) {

            throw new Error(
                `Image server returned ${response.status}`
            );
        }


        /*
         * Receive the decrypted image as a Blob.
         *
         * The server performs the decryption.
         */

        const blob =
            await response.blob();


        if (!blob.size) {

            throw new Error(
                "The server returned an empty image."
            );
        }


        const objectUrl =
            URL.createObjectURL(
                blob
            );


        imageElement.src =
            objectUrl;


        imageElement.style.display =
            "block";


        if (loadingElement) {

            loadingElement.remove();
        }


        /*
         * Clean up the temporary browser
         * object URL after the image is loaded.
         */

        imageElement.addEventListener(
            "load",
            () => {

                /*
                 * Keep the image displayed.
                 * The browser has loaded the Blob.
                 */

                setTimeout(
                    () => {

                        URL.revokeObjectURL(
                            objectUrl
                        );

                    },
                    1000
                );
            },
            {
                once: true
            }
        );


        /*
         * Open full-size viewer when clicked.
         */

        imageElement.addEventListener(
            "click",
            () => {

                openImageViewer(
                    objectUrl
                );

            }
        );


    } catch (error) {

        console.error(
            "Unable to load chat image:",
            imageId,
            error
        );


        if (loadingElement) {

            loadingElement.textContent =
                "Unable to load image.";
        }
    }
}


// ============================================================
// IMAGE VIEWER
// ============================================================

function openImageViewer(
    imageSource
) {

    if (!imageSource) {
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
        imageSource;


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
// CONVERT FILE TO BASE64
//
// Only used temporarily in memory to send the image
// to Vercel.
//
// The encryption is performed on Vercel.
// ============================================================

function fileToBase64(
    file
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const reader =
                new FileReader();


            reader.onload =
                () => {

                    try {

                        const result =
                            reader.result;


                        if (
                            typeof result !==
                            "string"
                        ) {

                            reject(
                                new Error(
                                    "Unable to read image."
                                )
                            );

                            return;
                        }


                        const commaIndex =
                            result.indexOf(",");


                        if (
                            commaIndex ===
                            -1
                        ) {

                            reject(
                                new Error(
                                    "Invalid image data."
                                )
                            );

                            return;
                        }


                        /*
                         * Remove:
                         *
                         * data:image/jpeg;base64,
                         *
                         * leaving only Base64 data.
                         */

                        const base64 =
                            result.slice(
                                commaIndex + 1
                            );


                        resolve(
                            base64
                        );


                    } catch (error) {

                        reject(
                            error
                        );
                    }
                };


            reader.onerror =
                () => {

                    reject(
                        new Error(
                            "Unable to read image."
                        )
                    );
                };


            reader.readAsDataURL(
                file
            );
        }
    );
}


// ============================================================
// IMAGE UPLOAD
//
// IMPORTANT:
//
// This sends JSON.
//
// It does NOT use FormData.
//
// This matches the current messages.js backend.
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
            "Image is too large. Maximum size is 750 KB."
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
            "Preparing image:",
            file.name,
            file.type,
            file.size
        );


        // ====================================================
        // CONVERT TO BASE64
        // ====================================================

        const base64Image =
            await fileToBase64(
                file
            );


        console.log(
            "Image converted to Base64."
        );


        // ====================================================
        // SEND TO VERCEL
        //
        // Vercel encrypts it using:
        //
        // IMAGE_ENCRYPTION_KEY
        //
        // The key never reaches this browser.
        // ====================================================

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

                            type:
                                "image",

                            mimeType:
                                file.type,

                            image:
                                base64Image
                        })
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
            !result ||
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


        /*
         * Refresh chat immediately.
         */

        lastMessageSignature =
            "";


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
// INITIALIZE IMAGE UPLOAD
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
                !chatAuthenticated ||
                !sessionToken
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


            /*
             * Allow selecting the same image again.
             */

            imageInput.value =
                "";
        }
    );
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


    if (
        !input ||
        !button
    ) {

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

                            type:
                                "text",

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


        input.value =
            "";


        input.focus();


        /*
         * Force refresh.
         */

        lastMessageSignature =
            "";


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
            "Notify to SAP";
    }
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
// DELETE ALL CHAT HISTORY
// ============================================================

async function deleteAllChatHistory() {

    if (
        !chatAuthenticated ||
        !sessionToken
    ) {

        alert(
            "You are not authenticated."
        );

        return;
    }


    const confirmed =
        confirm(

            "WARNING!\n\n" +

            "This will permanently delete ALL update " +
            "messages and photos from the database.\n\n" +

            "This action cannot be undone.\n\n" +

            "Are you sure you want to continue?"
        );


    if (!confirmed) {

        return;
    }


    const button =
        document.getElementById(
            "deleteChatHistoryBtn"
        );


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "Deleting...";
    }


    try {

        console.log(
            "Deleting all chat history..."
        );


        const response =
            await fetch(
                MESSAGES_API,
                {

                    method:
                        "DELETE",

                    headers: {

                        "Accept":
                            "application/json",

                        "Authorization":
                            `Bearer ${sessionToken}`
                    }
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
                "Server returned an invalid delete response."
            );
        }


        console.log(
            "Delete response:",
            response.status,
            result
        );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            handleAuthenticationExpired();

            return;
        }


        if (!response.ok) {

            throw new Error(
                result.error ||
                `Server returned ${response.status}`
            );
        }


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result.error ||
                "Unable to delete chat history."
            );
        }


        console.log(
            "All chat history deleted successfully."
        );


        /*
         * Force next Firebase read to render
         * the empty database.
         */

        lastMessageSignature =
            "";


        const chat =
            document.getElementById(
                "askme"
            );


        if (chat) {

            chat.innerHTML =
                "";

            const emptyElement =
                document.createElement(
                    "div"
                );


            emptyElement.className =
                "loading";


            emptyElement.textContent =
                "No messages yet.";


            chat.appendChild(
                emptyElement
            );
        }


        alert(
            "All chat history has been deleted successfully."
        );


    } catch (error) {

        console.error(
            "Delete chat history error:",
            error
        );


        alert(
            error.message ||
            "Unable to delete chat history."
        );


    } finally {

        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Delete updates";
        }
    }
}


// ============================================================
// LOGOUT / CLOSE CHAT
// ============================================================

async function closeChat() {

    stopMessagePolling();


    try {

        if (sessionToken) {

            await fetch(
                LOGOUT_API,
                {

                    method:
                        "POST",

                    headers: {

                        "Accept":
                            "application/json",

                        "Authorization":
                            `Bearer ${sessionToken}`
                    }
                }
            );
        }


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );


    } finally {

        dateToken =
            "";


        sessionToken =
            "";


        csrfToken =
            "";


        chatAuthenticated =
            false;


        // ====================================================
        // CLEAR INPUTS
        // ====================================================

        const dateInput =
            document.getElementById(
                "dateInput"
            );


        if (dateInput) {

            dateInput.value =
                "";
        }


        const dateError =
            document.getElementById(
                "dateError"
            );


        if (dateError) {

            dateError.textContent =
                "";
        }


        const password =
            document.getElementById(
                "chatPassword"
            );


        if (password) {

            password.value =
                "";
        }


        const passwordError =
            document.getElementById(
                "passwordError"
            );


        if (passwordError) {

            passwordError.textContent =
                "";
        }


        const messageInput =
            document.getElementById(
                "msg"
            );


        if (messageInput) {

            messageInput.value =
                "";
        }


        const imageInput =
            document.getElementById(
                "imageInput"
            );


        if (imageInput) {

            imageInput.value =
                "";
        }


        // ====================================================
        // HIDE CHAT
        // ====================================================

        const passwordGate =
            document.getElementById(
                "chatPasswordGate"
            );


        if (passwordGate) {

            passwordGate.classList.remove(
                "visible"
            );
        }


        const authenticatedChat =
            document.getElementById(
                "authenticatedChat"
            );


        if (authenticatedChat) {

            authenticatedChat.classList.remove(
                "visible"
            );
        }


        const askmeContainer =
            document.getElementById(
                "askmeContainer"
            );


        if (askmeContainer) {

            askmeContainer.classList.remove(
                "visible"
            );
        }


        const sapContainer =
            document.getElementById(
                "sapContainer"
            );


        if (sapContainer) {

            sapContainer.style.display =
                "block";
        }


        const chat =
            document.getElementById(
                "askme"
            );


        if (chat) {

            chat.innerHTML =
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


    dateToken =
        "";


    stopMessagePolling();


    const askmeContainer =
        document.getElementById(
            "askmeContainer"
        );


    if (askmeContainer) {

        askmeContainer.classList.remove(
            "visible"
        );
    }


    const authenticatedChat =
        document.getElementById(
            "authenticatedChat"
        );


    if (authenticatedChat) {

        authenticatedChat.classList.remove(
            "visible"
        );
    }


    const passwordGate =
        document.getElementById(
            "chatPasswordGate"
        );


    if (passwordGate) {

        passwordGate.classList.remove(
            "visible"
        );
    }


    const sapContainer =
        document.getElementById(
            "sapContainer"
        );


    if (sapContainer) {

        sapContainer.style.display =
            "block";
    }


    const dateInput =
        document.getElementById(
            "dateInput"
        );


    if (dateInput) {

        dateInput.value =
            "";
    }


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


    photoButton.addEventListener(
        "click",
        () => {

            if (
                !chatAuthenticated ||
                !sessionToken
            ) {

                alert(
                    "Please login to the chat first."
                );

                return;
            }


            imageInput.click();
        }
    );


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


            /*
             * Allows the same image to be selected
             * again.
             */

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

        // ====================================================
        // SAP CONTENT
        // ====================================================

        loadSapContent();


        // ====================================================
        // DATE BUTTON
        // ====================================================

        const verifyDateButton =
            document.getElementById(
                "verifyDateButton"
            );


        if (verifyDateButton) {

            verifyDateButton.addEventListener(
                "click",
                verifyDate
            );
        }


        // ====================================================
        // DATE ENTER
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
        // PASSWORD CANCEL
        // ====================================================

        const cancelPasswordButton =
            document.getElementById(
                "cancelPasswordBtn"
            );


        if (cancelPasswordButton) {

            cancelPasswordButton.addEventListener(
                "click",
                closeChat
            );
        }


        // ====================================================
        // TEXT MESSAGE FORM
        // ====================================================

        const messageForm =
            document.getElementById(
                "form"
            );


        if (messageForm) {

            messageForm.addEventListener(
                "submit",
                sendMessage
            );
        }


        // ====================================================
        // PHOTO UPLOAD
        // ====================================================

        initializeImageUpload();


        // ====================================================
        // CLOSE CHAT
        // ====================================================

        const closeChatButton =
            document.getElementById(
                "closeaskmeBtn"
            );


        if (closeChatButton) {

            closeChatButton.addEventListener(
                "click",
                closeChat
            );
        }


        // ====================================================
        // DELETE CHAT HISTORY
        // ====================================================

        const deleteButton =
            document.getElementById(
                "deleteChatHistoryBtn"
            );


        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                deleteAllChatHistory
            );
        }


        console.log(
            "Chat application initialized."
        );
    }
);