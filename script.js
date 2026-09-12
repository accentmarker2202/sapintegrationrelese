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
// A source photo can be up to 10 MB.
// The browser compresses it before sending it.
//
// This allows normal iPhone photos of 2–3 MB,
// while keeping the final request smaller.
// ============================================================

const MAX_IMAGE_SIZE =
    10 * 1024 * 1024;

const MAX_UPLOAD_BYTES =
    2 * 1024 * 1024;

const MAX_IMAGE_WIDTH =
    2400;

const MAX_IMAGE_HEIGHT =
    2400;


const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
	"image/heic",
	"image/heif"
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
        document.getElementById("sapText");

    if (sapText) {
        sapText.innerHTML = sapContent;
    }
}


// ============================================================
// SHOW PASSWORD SCREEN
// ============================================================

function showChatPasswordGate() {

    const askmeContainer =
        document.getElementById("askmeContainer");

    const passwordGate =
        document.getElementById("chatPasswordGate");

    const authenticatedChat =
        document.getElementById("authenticatedChat");

    const sapContainer =
        document.getElementById("sapContainer");


    if (askmeContainer) {
        askmeContainer.classList.add("visible");
    }

    if (passwordGate) {
        passwordGate.classList.add("visible");
    }

    if (authenticatedChat) {
        authenticatedChat.classList.remove("visible");
    }

    if (sapContainer) {
        sapContainer.style.display = "none";
    }


    const passwordError =
        document.getElementById("passwordError");

    if (passwordError) {
        passwordError.textContent = "";
    }


    const password =
        document.getElementById("chatPassword");

    if (password) {

        password.value = "";

        setTimeout(() => {
            password.focus();
        }, 100);
    }
}


// ============================================================
// VERIFY DATE
// ============================================================

async function verifyDate() {

    const dateInputElement =
        document.getElementById("dateInput");

    const dateError =
        document.getElementById("dateError");

    const button =
        document.getElementById("verifyDateButton");


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
        button.textContent = "Checking...";


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

                    body:
                        JSON.stringify({
                            date: dateInput
                        })
                }
            );


        const responseText =
            await response.text();


        let result;


        try {

            result =
                JSON.parse(responseText);

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


        if (!dateToken) {

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

        button.disabled = false;
        button.textContent = "Continue";
    }
}


// ============================================================
// PASSWORD LOGIN
// ============================================================

async function loginToChat(event) {

    event.preventDefault();


    const passwordInput =
        document.getElementById("chatPassword");

    const errorElement =
        document.getElementById("passwordError");

    const unlockButton =
        document.getElementById("unlockButton");


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


    errorElement.textContent = "";

    unlockButton.disabled = true;
    unlockButton.textContent = "Checking...";


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

                    body:
                        JSON.stringify({
                            password: password,
                            dateToken: dateToken
                        })
                }
            );


        const responseText =
            await response.text();


        let result;


        try {

            result =
                JSON.parse(responseText);

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


        dateToken = "";

        chatAuthenticated = true;


        const passwordGate =
            document.getElementById(
                "chatPasswordGate"
            );

        const authenticatedChat =
            document.getElementById(
                "authenticatedChat"
            );


        if (passwordGate) {
            passwordGate.classList.remove("visible");
        }


        if (authenticatedChat) {
            authenticatedChat.classList.add("visible");
        }


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
        unlockButton.textContent = "Update the comments";
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
        document.getElementById("askme");


    if (!chat) {

        console.error(
            "Chat container #askme was not found."
        );

        return;
    }


    try {

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


        const responseText =
            await response.text();


        let result;


        try {

            result =
                JSON.parse(responseText);

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
            !Array.isArray(result.messages)
        ) {

            throw new Error(
                "Invalid messages data received from server."
            );
        }


        renderMessages(
            result.messages
        );


    } catch (error) {

        console.error(
            "LOAD MESSAGES ERROR:",
            error
        );


        if (!chat.querySelector(".message")) {

            showChatError(
                error.message ||
                "Unable to connect to the chat server."
            );
        }
    }
}
// ============================================================
// FORMAT MESSAGE DATE & TIME
// ============================================================

function formatMessageDateTime(timestamp) {

    if (
        timestamp === null ||
        timestamp === undefined ||
        timestamp === ""
    ) {
        return "";
    }


    const date =
        new Date(
            Number(timestamp)
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }


    return new Intl.DateTimeFormat(
        "en-GB",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }
    ).format(date);
}

// ============================================================
// RENDER MESSAGES
// ============================================================

function renderMessages(messages) {

    const chat =
        document.getElementById("askme");


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


    let signature;


    try {

        signature =
            JSON.stringify(messages);

    } catch (error) {

        signature = "";
    }


    if (
        signature &&
        signature === lastMessageSignature
    ) {

        return;
    }


    lastMessageSignature =
        signature;


    chat.innerHTML = "";


    if (messages.length === 0) {

        const emptyElement =
            document.createElement("div");

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
                document.createElement("div");

            messageElement.className =
                "message";


            // =================================================
            // USERNAME
            // =================================================

            const userElement =
                document.createElement("div");

            userElement.className =
                "message-user";

            userElement.textContent =
                `${message.username || "Unknown"}:`;

            messageElement.appendChild(
                userElement
            );
            
			// =================================================
			// MESSAGE DATE & TIME
			// =================================================

			const timeElement =
			document.createElement("div");

			timeElement.className =
			"message-time";

			timeElement.textContent =
			formatMessageDateTime(
			message.timestamp
			);

			if (timeElement.textContent) {

				messageElement.appendChild(
					timeElement
				);
				}

            // =================================================
            // PHOTO MESSAGE
            // =================================================

            if (
                message.type === "photo"
            ) {

                const imageContainer =
                    document.createElement("div");

                imageContainer.className =
                    "chat-image-container";


                const imageElement =
                    document.createElement("img");

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


                const loadingElement =
                    document.createElement("div");

                loadingElement.className =
                    "image-loading";

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


                // =================================================
                // DISPLAY BASE64 IMAGE RETURNED BY BACKEND
                // =================================================

                if (message.image) {

                    try {

                        const imageType =
                            message.mimeType ||
                            "image/jpeg";


                        imageElement.src =
                            `data:${imageType};base64,${message.image}`;


                        imageElement.style.display =
                            "block";


                        loadingElement.remove();


                        imageElement.addEventListener(
                            "click",
                            () => {

                                openImageViewer(
                                    imageElement.src
                                );
                            }
                        );


                    } catch (imageError) {

                        console.error(
                            "Unable to display photo:",
                            imageError
                        );


                        loadingElement.textContent =
                            "Unable to display image.";
                    }

                } else {

                    loadingElement.textContent =
                        message.error ||
                        "Unable to load image.";
                }


                return;
            }


            // =================================================
            // TEXT MESSAGE
            // =================================================

            const textElement =
                document.createElement("div");

            textElement.className =
                "message-text";


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
// IMAGE VIEWER
// ============================================================

function openImageViewer(
    imageSource
) {

    if (!imageSource) {
        return;
    }


    const overlay =
        document.createElement("div");

    overlay.className =
        "image-viewer-overlay";


    const image =
        document.createElement("img");

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
// LOAD IMAGE FROM FILE
// ============================================================

function loadImageFromFile(file) {

    return new Promise(
        (resolve, reject) => {

            const objectUrl =
                URL.createObjectURL(file);


            const image =
                new Image();


            image.onload =
                () => {

                    URL.revokeObjectURL(
                        objectUrl
                    );

                    resolve(image);
                };


            image.onerror =
                () => {

                    URL.revokeObjectURL(
                        objectUrl
                    );

                    reject(
                        new Error(
                            "The selected image could not be opened."
                        )
                    );
                };


            image.src =
                objectUrl;
        }
    );
}


// ============================================================
// PREPARE IMAGE FOR UPLOAD
// ============================================================

async function prepareImageForUpload(file) {

    if (
        file.size >
        MAX_IMAGE_SIZE
    ) {

        throw new Error(
            "The selected photo is too large. Please choose an image smaller than 10 MB."
        );
    }


    const image =
        await loadImageFromFile(file);


    let width =
        image.naturalWidth;

    let height =
        image.naturalHeight;


    if (
        !width ||
        !height
    ) {

        throw new Error(
            "Unable to determine the image dimensions."
        );
    }


    const scale =
        Math.min(
            1,
            MAX_IMAGE_WIDTH / width,
            MAX_IMAGE_HEIGHT / height
        );


    width =
        Math.max(
            1,
            Math.round(
                width * scale
            )
        );


    height =
        Math.max(
            1,
            Math.round(
                height * scale
            )
        );


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        width;

    canvas.height =
        height;


    const context =
        canvas.getContext(
            "2d"
        );


    if (!context) {

        throw new Error(
            "Your browser could not prepare the image."
        );
    }


    context.imageSmoothingEnabled =
        true;

    context.imageSmoothingQuality =
        "high";


    context.drawImage(
        image,
        0,
        0,
        width,
        height
    );


    let outputType =
        file.type === "image/png"
            ? "image/png"
            : "image/jpeg";


    let quality =
        0.88;


    let blob =
        null;


    for (
        let attempt = 0;
        attempt < 7;
        attempt++
    ) {

        blob =
            await new Promise(
                resolve => {

                    canvas.toBlob(
                        resolve,
                        outputType,
                        quality
                    );
                }
            );


        if (!blob) {

            throw new Error(
                "Unable to compress the selected image."
            );
        }


        if (
            blob.size <=
            MAX_UPLOAD_BYTES
        ) {

            break;
        }


        if (
            outputType ===
            "image/png"
        ) {

            outputType =
                "image/jpeg";

            quality =
                0.88;

        } else {

            quality -=
                0.08;
        }
    }


    if (!blob) {

        throw new Error(
            "Unable to prepare the image."
        );
    }


    if (
        blob.size >
        MAX_UPLOAD_BYTES
    ) {

        throw new Error(
            "This photo could not be compressed enough for upload. Please choose a smaller photo."
        );
    }


    return blob;
}


// ============================================================
// BLOB TO BASE64
// ============================================================

function blobToBase64(blob) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const reader =
                new FileReader();


            reader.onload =
                () => {

                    if (
                        typeof reader.result !==
                        "string"
                    ) {

                        reject(
                            new Error(
                                "Unable to read prepared image."
                            )
                        );

                        return;
                    }


                    const commaIndex =
                        reader.result.indexOf(",");


                    if (
                        commaIndex ===
                        -1
                    ) {

                        reject(
                            new Error(
                                "Invalid prepared image."
                            )
                        );

                        return;
                    }


                    resolve(
                        reader.result.slice(
                            commaIndex + 1
                        )
                    );
                };


            reader.onerror =
                () => {

                    reject(
                        new Error(
                            "Unable to read prepared image."
                        )
                    );
                };


            reader.readAsDataURL(
                blob
            );
        }
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


    const selectedPhotoName =
        document.getElementById(
            "selectedPhotoName"
        );


    if (selectedPhotoName) {

        selectedPhotoName.textContent =
            file.name ||
            "Photo selected";
    }


    if (
        !file.type ||
        !file.type.startsWith("image/")
    ) {

        alert(
            "Please select an image file."
        );

        return;
    }

/*

    if (
        file.type === "image/heic" ||
        file.type === "image/heif"
    ) {

        alert(
            "HEIC/HEIF photos are not supported by this browser upload. Please choose JPG, PNG, or WebP from your iPhone."
        );

        return;
    }
*/


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


    if (
        file.size >
        MAX_IMAGE_SIZE
    ) {

        alert(
            "The selected photo is too large. Maximum source size is 10 MB."
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
            "Preparing photo:",
            file.name,
            file.type,
            file.size
        );


        const preparedBlob =
            await prepareImageForUpload(
                file
            );


        console.log(
            "Prepared image:",
            preparedBlob.type,
            preparedBlob.size
        );


        const base64Image =
            await blobToBase64(
                preparedBlob
            );


        // ====================================================
        // IMPORTANT
        //
        // messages.js expects:
        //
        // type: "photo"
        //
        // NOT:
        //
        // type: "image"
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
                                "photo",

                            mimeType:
                                preparedBlob.type ||
                                "image/jpeg",

                            image:
                                base64Image
                        })
                }
            );


        const responseText =
            await response.text();


        console.log(
            "Photo upload response:",
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
                "Server returned an invalid upload response."
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
            !result.success
        ) {

            throw new Error(
                result.error ||
                "Unable to upload image."
            );
        }


        console.log(
            "Photo uploaded successfully."
        );


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
                "Screen";
        }


        if (selectedPhotoName) {

            selectedPhotoName.textContent =
                "";
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


            imageInput.value =
                "";
        }
    );
}


// ============================================================
// SEND TEXT MESSAGE
// ============================================================

async function sendMessage(
    event
) {

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
        document.getElementById("msg");


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
                "Unable to send message."
            );
        }


        input.value =
            "";

        input.focus();


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
        document.getElementById("askme");


    if (chat) {
        chat.innerHTML = "";
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
            "This will permanently delete ALL update messages and photos from the database.\n\n" +
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

        dateToken = "";
        sessionToken = "";
        csrfToken = "";
        chatAuthenticated = false;


        const dateInput =
            document.getElementById(
                "dateInput"
            );

        if (dateInput) {
            dateInput.value = "";
        }


        const dateError =
            document.getElementById(
                "dateError"
            );

        if (dateError) {
            dateError.textContent = "";
        }


        const password =
            document.getElementById(
                "chatPassword"
            );

        if (password) {
            password.value = "";
        }


        const passwordError =
            document.getElementById(
                "passwordError"
            );

        if (passwordError) {
            passwordError.textContent = "";
        }


        const messageInput =
            document.getElementById(
                "msg"
            );

        if (messageInput) {
            messageInput.value = "";
        }


        const imageInput =
            document.getElementById(
                "imageInput"
            );

        if (imageInput) {
            imageInput.value = "";
        }


        const selectedPhotoName =
            document.getElementById(
                "selectedPhotoName"
            );

        if (selectedPhotoName) {
            selectedPhotoName.textContent = "";
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
            chat.innerHTML = "";
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
        dateInput.value = "";
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


        initializeImageUpload();


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

