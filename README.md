To run this project do  
`$npm install`  
`$npm run dev`  
And visit the app at  
`http://localhost:3000/`


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

MobX with decorators has been used with CRA without ejecting!  
This is achieved via some extra configuration.  
First, use react-app-rewired  
https://github.com/timarney/react-app-rewired  
Then, since we're on CRA version 2, also setup as shown here  
https://github.com/arackaf/customize-cra  
Particularly inspect the config-overrides.js file for details therein.  
Happy MobX Decorating!  
