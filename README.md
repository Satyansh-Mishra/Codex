# Snap2Recipe 🥦🔍

 Snap2Recipe is an advanced application that uses AI to detect vegetables in images and recommend recipes based on the ingredients found. It features a modern Next.js frontend, a robust Express.js backend, and a dedicated FastAPI service for object detection using YOLOv8.

## 🚀 Features

-   **AI Interaction**: Detects vegetables from uploaded images or image URLs using a custom YOLOv8 model.
-   **Smart Recipes**: Recommends recipes based on available ingredients.
-   **User Accounts**: Secure authentication and user management.
-   **Modern UI**: Responsive and dynamic interface built with Next.js and Tailwind CSS.

## 📂 Project Structure

The project is organized into three main components:

-   `AI/`: Python FastAPI service running the YOLOv8 detection model.
-   `Fodoscope_Backend/`: Node.js Express server handling API logic, database users, and recipes.
-   `Fodoscope_Frontend/`: Next.js application for the user interface.

## Live Deployment  

You can access the deployed services here:

- **Frontend:** https://your-frontend-link.com  
- **Backend API:** https://your-backend-link.com  
- **ML Model Service:** https://your-ml-service-link.com  

## Tech Stack  

<p align="center">
  <img src="https://skillicons.dev/icons?i=python,fastapi,pytorch,opencv,nodejs,express,mongodb,nextjs,react,tailwind,js,html,css,git,github,vscode" />
</p>

---

## How It Works  

1. The user uploads an image or provides an image URL.  
2. The AI model detects vegetables from the image.  
3. The backend processes detected ingredients.  
4. Recipes are matched and generated.  
5. The frontend displays personalized recommendations.

---

## Use Cases  

- Smart kitchen and cooking assistants  
- Meal planning and food management  
- Nutrition and diet platforms  
- Food technology research  
- Educational cooking applications
