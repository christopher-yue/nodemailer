const nodemailer = require("nodemailer");
const request = require("request");
const cheerio = require("cheerio");
const credentials = require("./credentials.json");

const to = credentials.to;
const from = credentials.from;
const sender_email = credentials.sender_email;
const sender_password = credentials.sender_password;

if (process.argv.length > 2) {
  artists = [];
  songs = [];
  result = "";
  request(
    "https://www.popvortex.com/music/charts/top-rap-songs.php",
    function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        $("em.artist").each(function (i, element) {
          artists.push($(this).text());
        });
        $("cite.title").each(function (i, element) {
          songs.push($(this).text());
        });
      }
      for (let i = 2; i < process.argv.length; i++) {
        for (let j = 0; j < artists.length; j++) {
          if (artists[j].toLowerCase().includes(process.argv[i])) {
            result +=
              "<p><b>" + artists[j] + "</b>: <em>" + songs[j] + "</em></p>";
          }
        }
      }
      // let mailOptions = {
      //   from: from,
      //   to: to,
      //   subject: "issa subject",
      //   html: result,
      // };
      // transporter.sendMail(mailOptions, (error, info) => {
      //   if (error) {
      //     console.log(error);
      //   } else {
      //     console.log("email sent");
      //   }
      // });
      //console.log(result);
    }
  );
} else {
  console.log("You did not speicfy any artists");
}

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: sender_email,
    pass: sender_password,
  },
});
