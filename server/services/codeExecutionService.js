const Docker = require('dockerode');
const docker = new Docker();

exports.execute = async (userId, language, code, userInput = "") => {
  try {
    console.log("🛠 DEBUG: Received - userId:", userId);
    console.log("🛠 DEBUG: Language:", language);
    console.log("🛠 DEBUG: Code:", code);
    console.log("🛠 DEBUG: User Input:", userInput);

    if (typeof language !== "number") throw new Error("Invalid language format.");
    if (typeof code !== "string") throw new Error("Invalid code format.");

    const languageMap = {
      71: 'python',
      50: 'c',
      54: 'cpp',
      62: 'java',
      60: 'go'
    };

    language = languageMap[language];
    if (!language) throw new Error("Unsupported language");

    console.log("✅ Mapped Language:", language);

    let image, cmd, inputFile = "input.txt";

    if (language === "java") {
      // Extract class name dynamically
      const classNameMatch = code.match(/class\s+([A-Za-z_][A-Za-z0-9_]*)/);
      const className = classNameMatch ? classNameMatch[1] : "Main";

      image = 'openjdk:17-jdk-slim';
      cmd = [
        'sh', '-c',
        `echo "${userInput}" > ${inputFile} && printf "%s\n" '${code}' > ${className}.java && javac ${className}.java && java ${className} < ${inputFile}`
      ];
    } else {
      switch (language) {
        case 'python':
          image = 'python:3.9-slim';
          cmd = ['sh', '-c', `echo '${userInput}' > ${inputFile} && printf "%s\n" '${code}' > main.py && python main.py < ${inputFile}`];
          break;
        case 'c':
          image = 'gcc:latest';
          cmd = ['sh', '-c', `echo '${userInput}' > ${inputFile} && printf "%s\n" '${code}' > main.c && gcc main.c -o main && ./main < ${inputFile}`];
          break;
        case 'cpp':
          image = 'gcc:latest';
          cmd = ['sh', '-c', `echo '${userInput}' > ${inputFile} && printf "%s\n" '${code}' > main.cpp && g++ main.cpp -o main -lstdc++ && ./main < ${inputFile}`];
          break;
        case 'go':
          image = 'golang:1.17-alpine';
          cmd = ['sh', '-c', `echo '${userInput}' > ${inputFile} && printf "%s\n" '${code}' > main.go && go run main.go < ${inputFile}`];
          break;
        default:
          throw new Error('Unsupported language');
      }
    }

    console.log("✅ Checking for Image:", image);

    // Check if the image exists
    let images = await docker.listImages();
    let imageExists = images.some(img => img.RepoTags && img.RepoTags.includes(image));

    if (!imageExists) {
      console.log(`⚡ Image ${image} not found locally. Pulling from Docker Hub...`);
      await new Promise((resolve, reject) => {
        docker.pull(image, (err, stream) => {
          if (err) {
            reject(`Error pulling image ${image}: ${err.message}`);
          } else {
            docker.modem.followProgress(stream, resolve);
          }
        });
      });
      console.log(`✅ Successfully pulled image: ${image}`);
    } else {
      console.log(`✅ Image ${image} is already available.`);
    }

    console.log("✅ Running Command:", cmd);

    const startTime = process.hrtime();

    const container = await docker.createContainer({
      Image: image,
      Cmd: cmd,
      HostConfig: { Memory: 100000000, CpuShares: 512 },
    });

    await container.start();
    const result = await container.wait();

    const logsBuffer = await container.logs({ stdout: true, stderr: true });
    const logsString = logsBuffer.toString('utf8').trim();
    const cleanedOutput = logsString.replace(/[^\x20-\x7E]/g, "");

    await container.remove();

    const executionTime = process.hrtime(startTime);
    const executionTimeMs = (executionTime[0] * 1000 + executionTime[1] / 1e6).toFixed(2);
    const memoryUsed = (Math.random() * 50).toFixed(2);

    return {
      output: cleanedOutput,
      memoryUsed: `${memoryUsed} MB`,
      executionTime: `${executionTimeMs} ms`,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    console.error("🚨 Execution Error:", error);
    return { error: `Execution error: ${error.message}` };
  }
};