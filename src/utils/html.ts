import * as cheerio from 'cheerio';

export const __html = (
  content: string | cheerio.AnyNode | Buffer,
): cheerio.CheerioAPI => {
  const $ = cheerio.load(content, null, false);

  return $;
};
