const nodemailer = require("nodemailer");
const request = require("request");
const cheerio = require("cheerio");
const credentials = require("./credentials.json");

const url = "https://www.popvortex.com/music/charts/top-rap-songs.php";

const to = credentials.to;
const from = credentials.from;
const sender_email = credentials.sender_email;
const sender_password = credentials.sender_password;

if (process.argv.length > 2) {
  request(url, function (error, response, html) {
    var songsFound = [];
    var artistsFound = [];
    var artistsFoundIndex = new Array(process.argv.length);
    var subject = "Your artists are: ";
    var htmlMessage = "";
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html);
      // search for element containing song title and artist name
      $("p.title-artist").each(function (i, element) {
        // loop through lists of artists provided by user
        for (let i = 2; i < process.argv.length; i++) {
          // check if artist name given is in any of the artist names found
          if (
            $(this)
              .find(".artist")
              .text()
              .trim()
              .toLowerCase()
              .includes(process.argv[i])
          ) {
            // when an artist name matches add their name and corresponding song to arrays
            songsFound.push($(this).find(".title").text().trim());
            artistsFound.push($(this).find(".artist").text().trim());
            artistsFoundIndex[i] = 1;
          }
        }
      });
    }

    // convert artists found and songs found into string to be passed as html in email
    for (let i = 0; i < artistsFound.length; i++)
      htmlMessage +=
        "<p><b>" + artistsFound[i] + "</b>: <em>" + songsFound[i] + "</em></p>";

    // adds artists found from list of artists given to string to be passed as subject in email
    for (let i = 2; i < process.argv.length; i++) {
      if (artistsFoundIndex[i] == 1) subject += process.argv[i];
      if (i < process.argv.length - 1 && artistsFoundIndex[i + 1] == 1)
        subject += ", ";
    }

    // send email
    sendEmail(subject, htmlMessage);
  });
} else console.log("You did not speicfy any artists");

function sendEmail(subject, htmlMessage) {
  // transporter object
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: sender_email,
      pass: sender_password,
    },
  });

  // mail options
  let mailOptions = {
    from: from,
    to: to,
    subject: subject,
    html: htmlMessage,
  };

  // sends message
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.log(error);
    else console.log("email sent");
  });
}
