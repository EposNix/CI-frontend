# Backend API Hooks for Couch Influencer

## Overview

This document outlines the required backend API endpoints (hooks) to support the "Couch Influencer" application. The primary goals are to:
1.  Securely manage user authentication.
2.  Move the Gemini API calls from the client to the server to protect the API key.
3.  Implement a server-side credit system to track user generations instead of relying on insecure `localStorage`.
4.  Provide endpoints for handling payments to replenish credits.

## 1. Authentication

### POST `/api/auth/google`

Handles user sign-in and account creation using the JWT credential from Google Sign-In.

-   **Method:** `POST`
-   **Request Body:**
    ```json
    {
      "token": "<google_id_token_credential>"
    }
    ```
-   **Server Logic:**
    1.  Receive the JWT from the client.
    2.  Verify the integrity and signature of the Google ID token.
    3.  Extract user information (e.g., email, name, Google ID).
    4.  Check if a user with this Google ID exists in the database.
        -   If **yes**, retrieve the user.
        -   If **no**, create a new user account and grant them the initial free generation credits (e.g., 5).
    5.  Generate a secure session token for the client (e.g., a backend-signed JWT).
    6.  Return the session token and user data to the client.
-   **Success Response (200 OK):**
    ```json
    {
      "sessionToken": "<your_backend_session_token>",
      "user": {
        "id": "user_db_id_123",
        "email": "user@example.com",
        "remainingGenerations": 5
      }
    }
    ```
-   **Error Response (401 Unauthorized):**
    -   If the Google token is invalid or verification fails.

## 2. User Management

### GET `/api/user/me`

Fetches the current logged-in user's data, primarily to sync their remaining generation credits.

-   **Method:** `GET`
-   **Headers:**
    -   `Authorization: Bearer <your_backend_session_token>`
-   **Server Logic:**
    1.  Verify the session token from the `Authorization` header.
    2.  Retrieve the corresponding user from the database.
    3.  Return the user's details.
-   **Success Response (200 OK):**
    ```json
    {
      "user": {
        "id": "user_db_id_123",
        "email": "user@example.com",
        "remainingGenerations": 4
      }
    }
    ```
-   **Error Response (401 Unauthorized):**
    -   If the token is missing, invalid, or expired.

## 3. Core Functionality

### POST `/api/generations`

The core endpoint for creating an influencer image. This acts as a secure proxy to the Gemini API.

-   **Method:** `POST`
-   **Headers:**
    -   `Authorization: Bearer <your_backend_session_token>`
-   **Request Body:**
    ```json
    {
      "selfie": {
        "base64": "...",
        "mimeType": "image/jpeg"
      },
      "location": {
        "base64": "...",
        "mimeType": "image/png"
      } 
      // OR
      // "locationPrompt": "A beautiful beach in Bali at sunset"
    }
    ```
-   **Server Logic:**
    1.  Verify the user's session token.
    2.  Check if the user has `remainingGenerations > 0`. If not, reject the request.
    3.  Construct the appropriate request payload for the Gemini API using the server's secret API key.
    4.  Call the Gemini API.
    5.  On a successful response from Gemini:
        a. Decrement the user's `remainingGenerations` count in the database.
        b. Forward the generated image data and any text back to the client.
    6.  Handle any errors from the Gemini API gracefully.
-   **Success Response (200 OK):**
    ```json
    {
      "image": "data:image/png;base64,...",
      "text": "Here's your generated image!",
      "remainingGenerations": 3 
    }
    ```
-   **Error Responses:**
    -   **401 Unauthorized:** Invalid session token.
    -   **402 Payment Required:** User is out of generation credits.
    -   **400 Bad Request:** Invalid or missing request body parameters.
    -   **500 Internal Server Error:** The call to the Gemini API failed.

## 4. Payments & Credits

### POST `/api/payments/create-checkout-session`

Initiates a payment flow with a third-party provider like Stripe to purchase more credits.

-   **Method:** `POST`
-   **Headers:**
    -   `Authorization: Bearer <your_backend_session_token>`
-   **Request Body:**
    ```json
    {
      "productId": "UNLOCK_100_GENERATIONS" 
    }
    ```
-   **Server Logic:**
    1.  Verify the user's session token.
    2.  Use the payment provider's SDK (e.g., Stripe) to create a checkout session.
    3.  Include user metadata (like `userId`) in the session so you can identify the purchase later.
    4.  Return the checkout session URL to the client.
-   **Success Response (200 OK):**
    ```json
    {
      "checkoutUrl": "https://checkout.stripe.com/..."
    }
    ```

### POST `/api/payments/webhook`

A webhook endpoint for the payment provider to send notifications (e.g., `checkout.session.completed`). **This endpoint should not be called by the client.**

-   **Method:** `POST`
-   **Request Body:** The payload structure will be defined by the payment provider (e.g., Stripe's Event object).
-   **Server Logic:**
    1.  **Crucially, verify the webhook signature** to ensure the request is genuinely from the payment provider.
    2.  Parse the event payload to confirm the payment was successful.
    3.  Extract the user metadata (e.g., `userId`) you stored during checkout creation.
    4.  Update the user's account in the database by adding the purchased credits (e.g., `remainingGenerations += 100`).
-   **Success Response (200 OK):**
    -   Return a `200` status to acknowledge receipt of the event. Any other status code may cause the payment provider to retry the webhook.
