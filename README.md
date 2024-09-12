## Purpose
This is a SFML Chatbot that allows users to chat with SFML documentation. If you have any questions about a specific method or property, the SFML assistant will help answer your query. You can also prompt it to give you sample code in case you do not understand how a specific method or function works.

This project aims to help newer programming students who are using code documentation for the very first time. Understanding documentation can be challenging, so this chatbot is designed to help students navigate and engage with it more easily.

The chatbot uses MongoDB's Atlas vector database to store and retrieve relevant information about SFML 2.5.1 documentation. 

## Demo



https://github.com/user-attachments/assets/c5866ef3-9694-4381-9ba2-21b0a228ee00




## Getting Started - Using NPM

1. Clone the repo on to your local computer.

```bash
git clone [github link]
```
2. Install all the rquired packages using:

```bash
npm install
```
3. Set up your .env file. I have uploaded a .env.example file that shows you the environment variables you need.
   - Make sure you have an Open AI account and a usable Open AI key
   - The rest of the keys are related to your Mongo DB configuration (fill them out accordingly)
   - CHANGE ```.env.example``` to ```.env```

4. Run your development server using:

```bash
npm run dev
```

## Getting Started - Using Dockerfile

1. Clone the repo on to your local computer.

```bash
git clone [github link]
```
2. Build your Docker image. 

```bash
docker build -t <insert-whatever-image-name-here> .
```
3. Finally, we can run the image:

```bash
docker run -p 3000:3000 <image-name>
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
