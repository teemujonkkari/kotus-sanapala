#!/usr/bin/env node

"use strict";

const fs = require("fs/promises");
const parser = require("xml2json");

const yargs = require("yargs/yargs");
const {hideBin} = require("yargs/helpers");
const argv = yargs(hideBin(process.argv)).argv;

const main = async () => {
  if (!argv?.letters?.length || !argv.limit) {
    console.log("☠️ Check your arguments --letters and --limit");
  } else {
    // Get all arguments
    const letters = argv?.letters?.toLowerCase()?.split("") || [];
    const limit = argv?.limit || 0;

    // Get all words from the dictionary
    const words = await getDictionaryWords();

    // Filter words by length
    const wordsWithNumberOfLetters = words.filter(w => w.length === limit);

    // Filter words by letters
    const filteredWords = wordsWithNumberOfLetters.filter(w => {
      const lettersInWord = w.split("");
      let lettersArray = [...letters];

      // Check if all letters in the word are in the given letters array.
      // Values in letters array can be used only once.
      const matchingWords = lettersInWord.every(l => {
        const index = lettersArray.indexOf(l);

        if (index > -1) {
          lettersArray.splice(index, 1);
          return true;
        }
        return false;
      });

      return matchingWords;
    });

    // Remove duplicates
    const uniqueWords = [...new Set(filteredWords)];

    // Print words
    console.table(uniqueWords);
  }
};

/**
 *
 * @returns {Promise<string[]>}
 */
const getDictionaryWords = async () => {
  try {
    // source: https://kaino.kotus.fi/sanat/nykysuomi/
    const xml = await fs.readFile(
      "./kotus-sanalista_v1/kotus-sanalista_v1.xml",
      {encoding: "utf8"}
    );
    const data = JSON.parse(parser.toJson(xml));

    return data["kotus-sanalista"]?.st.map(r => r.s);
  } catch (err) {
    console.log(err);
  }
};

main();
