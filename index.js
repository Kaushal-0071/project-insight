import fg from 'fast-glob';
import fs from 'fs/promises';
import path from 'path';

import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } from "@google/generative-ai";

async function readAllFiles() {
    
  try {
    let text=""
    //const baseDir = process.cwd();
    
    const baseDir = "C:\\Users\\Administrator\\Desktop\\sdfsdfdf";

    
    const files = await fg(['**/*', '!**/node_modules/**', '!**/package-lock.json'], {
      cwd: baseDir,
      onlyFiles: true
    });
    
    const fileContents = await Promise.all(
      files.map(async (relativeFilePath) => {
        const filePath = path.join(baseDir, relativeFilePath);
        const content = await fs.readFile(filePath, 'utf8');
        return { filePath, content };
      })
    );
    
    fileContents.forEach(({ filePath, content }) => {
     text+=`Content of ${filePath}:     \n${content}\n`
     
    });
    return text
  } catch (err) {
    console.error('Error reading files:', err);
  }

}


let x= await readAllFiles();
//console.log(x);





const apiKey = "AIzaSyCUHMZpf2pJ9ezf-8w2sqJbUbvxpDH9ts8";
const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash"
    
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  async function insight(text) {
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
            role: "user",
            parts: [
              {text: "you are a advanced programmer and give me insight of the project and the files in the project if there are any vulnerabilities or errors or improve ments in the files give them in a list in 4-5 lines max" },
            ],
          }
      ],
    });
  
    const result = await chatSession.sendMessage(text);
    
    return result.response.text();
  }
  
  const generationConfig2 = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };


  
  async function update(text,x) {
    const model1 = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction:` you are a advanced programmer, give code to update the project keeping the given improvements and vulnerabilities in the files in the project in mind.
                                          the given output should be in the form {filepath:"code of the file",
                                          filepath:"code of the file "} it should be in a json format. it should not contain any extra text take the filepath from given data. 
                                            `
        
      });

    const chatSession1 = model1.startChat({
        generationConfig2,
      history: [
        {
            role: "user",
            parts: [
              {text: x+ "\n "+ text+"\n " },
            ],
          }
      ],
    });
  
    const result = await chatSession1.sendMessage(text);
    //console.log(result.response.text());
    //console.log(JSON.parse(result.response.text().replace("```json","").replace(/.{3}$/, '')));
    return JSON.parse(result.response.text().replace("```json","").replace(/.{3}$/, ''))
    
  }
  async function applyUpdates(updates) {
    // Iterate over each file update provided in the JSON object
    for (const [filepath, newCode] of Object.entries(updates)) {
      // Resolve the full file path relative to the current working directory
      
      try {
        // Write the new code into the file using utf8 encoding
        await fs.writeFile(filepath, newCode, 'utf8');
        console.log(`File "${filepath}" updated successfully.`);
      } catch (error) {
        console.error(`Error updating file "${filepath}":`, error);
      }
    }
  }
  
  let y= await insight(x);
  console.log(y);
  console.log("............................................................................................");
  let z= await update(x,y)
applyUpdates(z);

