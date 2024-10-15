require("dotenv").config();
const Groq = require("groq-sdk");
const { Bot, GrammyError, HttpError } = require("grammy");
const { Markup } = require("telegraf");

let waitingForAiQuestion = false;
const bot = new Bot(process.env.BOT_API_KEY);
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

bot.api.setMyCommands([
  {
    command: "student",
    description: "info abt student",
  },
  {
    command: "contacts",
    description: "student contacts",
  },
  {
    command: "it_technologies",
    description: "abt technologies",
  },
  {
    command: "ai",
    description: "talk w ai",
  },
  {
    command: "end",
    description: "end session with ai",
  },
]);

bot.command("start", async (ctx) => {
  await ctx.reply("hello💅");
});

bot.command("student", async (ctx) => {
  ctx.react("💅");
  await ctx.reply("*Гриценко В\\.О * \nГрупа ІК\\-\\12", {
    parse_mode: "MarkdownV2",
  });
});

bot.command("contacts", async (ctx) => {
  await ctx.reply(
    'My contacts: \nНомер телефону +38099529<span class="tg-spoiler">2205</span> \nЕлектронна пошта: <span class="tg-spoiler">gritsenko5555@gmail.com</span>',
    {
      parse_mode: "HTML",
    }
  );
});

bot.command("it_technologies", async (ctx) => {
  await ctx.reply("WEB technology: nodeJS, grammyJS, Groq SDK");
});

bot.command("ai", async (ctx) => {
  await ctx.reply(`Send your question:`);
  waitingForAiQuestion = true;
});

bot.command("end", async (ctx) => {
  waitingForAiQuestion = false;
  await ctx.reply("type /ai to start the session again");
});

bot.on("message:text", async (ctx) => {
  if (waitingForAiQuestion) {
    const userQuery = ctx.message.text;
    const getAiRes = await aiResponse(userQuery);

    await ctx.reply(`AI answer: ${getAiRes}`);
    waitingForAiQuestion = true;
  }
});

async function aiResponse(query) {
  try {
    const res = await groq.chat.completions.create({
      messages: [{ role: "user", content: query }],
      model: "llama3-8b-8192",
    });
    return res.choices[0]?.message?.content || "ai didn't return a valid res";
  } catch (err) {
    return `i can't do this due to the err: ${err}`;
  }
}

bot.catch((err) => {
  const ctx = err.ctx;
  console.log(`error while handling update ${ctx.update.update_id}:`);
  const e = err.error;

  if (e instanceof GrammyError) {
    console.log("error in request", e.description);
  } else if (e instanceof HttpError) {
    console.log("could not contact telega", e);
  } else {
    console.log("unknown error");
  }
});

bot.start();
