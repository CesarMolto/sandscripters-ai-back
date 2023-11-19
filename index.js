// index.js
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
const app = express();
const port = 3001; // You can change this port if needed

// Imports
import { BingChat } from "bing-chat-rnz";
import dotenv from "dotenv";
import { oraPromise } from "ora";
dotenv.config();

app.use(cors());

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

// Post - Generate extra keywords
app.post("/generate-keywords", (req, res) => {
  console.log("Generating keywords");
  // Create bing chat instance
  const api = new BingChat({ cookie: process.env.BING_COOKIE });

  // Retrieve request information
  const body = req.body;
  const theme = body.theme;
  const userKeywords = body.userKeywords;
  if (!theme || !userKeywords) {
    res.json({ error: "no theme or userKeywords specified" });
    return;
  }
  const keywords = userKeywords; // body.keywords;
  console.log("userKeywords", userKeywords);
  const style = "realistic"; // body.style;
  // const colors = "red, blue"; // body.colors;
  //   console.log("body", body);

  // Generate extra keywords with bing chat
  const prompt = `First, provide 10 words and short phrases related to ${theme}.

	Secondly, provide 10 extra words and short phrases related to ${keywords}.

	Thirdly, provide 10 extra words and short phrases related to ${style} style for image generation.

	IMPORTANT: Display only the generated words together in a sigle line format separated only by ",".
	Do not display any other text within your response.`;

  oraPromise(api.sendMessage(prompt), {
    text: prompt,
    variant: "Precise",
  })
    .then((result) => {
      // Return generated keywords
      console.log("Generated keywords: ", result.text);
      res.json({ keywords: result.text });
    })
    .catch((error) => {
      res.json(error);
    });
});

// Post - Generate prompt
app.post("/generate-prompt", (req, res) => {
  // Create bing chat instance
  const api = new BingChat({ cookie: process.env.BING_COOKIE });

  // Retrieve keywords
  const body = req.body;
  if (!body.page || !body.keywords) {
    res.json({ error: "no page or keywords specified" });
    return;
  }
  const keywords = body.page + " webpage, " + body.keywords;

  // Generate prompt with bing chat
  const prompt = `Instruction: Generate a detailed prompt for an image generator AI model taking into account the
	following list of keywords: ${keywords}.

	IMPORTANT: Display only the generated prompt. Do not display any other text within your response.`;

  oraPromise(api.sendMessage(prompt), {
    text: prompt,
    variant: "Precise",
  })
    .then((result) => {
      // Return generated prompt
      console.log("Generated prompt: ", result.text);
      res.json({ prompt: result.text });
    })
    .catch((error) => {
      res.json(error);
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
