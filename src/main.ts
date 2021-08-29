import './style.css'

const baseURL:string = "https://cdn.contentful.com";
const space:string = "bxikrw4zp6pm";
const token:string = "OGPHs2wuhyz3M31yy93RTXoRfGrlfFS7Q6xNe3C4tuo";
const environment:string = "master";
const contentType:string = "triviaquestions";
let triviaData:any;

$.ajax({
  url: `${baseURL}/spaces/${space}/environments/${environment}/entries?access_token=${token}`
}).then(function (data) {
  triviaData = data;
  // Renders weather data on page.
  console.log(triviaData.items);
}, function (error) {
  console.log('bad request: ', error);
});

