import { Context } from "telegraf";
import createDebug from "debug";

const debug = createDebug("bot:start_command");

const start = () => async (ctx: Context) => {
  const message = `Welcome to BW Monastery. This is \n
*bold \*text*
_italic \*text_
__underline__
~strikethrough~
||spoiler||
*bold _italic bold ~italic bold strikethrough ||italic bold strikethrough spoiler||~ __underline italic bold___ bold*
[inline URL](http://www.example.com/)
[inline mention of a user](tg://user?id=123456789)
![👍](tg://emoji?id=5368324170671202286)
>Block quotation started
>Block quotation continued
>Block quotation continued
>Block quotation continued
>The last line of the block quotation
**>The expandable block quotation started right after the previous block quotation
>It is separated from the previous block quotation by an empty bold entity
>Expandable block quotation continued
>Hidden by default part of the expandable block quotation started
>Expandable block quotation continued
>The last line of the expandable block quotation with the expandability mark||
  \n欢迎来到吉祥宝聚寺`;
  debug(`Triggered "start" command with message \n${message}`);
  await ctx.replyWithMarkdownV2(message, { parse_mode: "Markdown" });
};

export { start };
