To run this project do  
`$npm install`  
`$npm run dev`  
And visit the app at  
`http://localhost:3000/`

VERIFY:  
To run this project **with the Service Worker** for offline testing, **the app must be built.**
`$npm run build`  
And serve the project with a simple server by doing...  
`$serve -s build`  
The app will be accessible at `http://localhost:5000`.  


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).



**Information: MobX with decorators can be used with CRA without ejecting.**
**This can be achieved via some extra configuration.**  

First, use react-app-rewired  
https://github.com/timarney/react-app-rewired  
Then, since we're on CRA version 2, also setup as shown here  
https://github.com/arackaf/customize-cra  
Particularly inspect the config-overrides.js file for details therein.  
Happy MobX Decorating!  
