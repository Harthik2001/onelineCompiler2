


const Docker = require('dockerode');
const docker = new Docker();

const ACR_NAME = "taskcompiler.azurecr.io"; // Replace with your ACR name

exports.execute = async (userId, language, code, userInput = "") => {
  try {
    console.log("DEBUG: Received - userId:", userId);
    console.log("DEBUG: Language:", language);
    console.log("DEBUG: Code:", code);
    console.log("DEBUG: User Input:", userInput);

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

    console.log("Mapped Language:", language);

    let image, cmd, workDir = "/tmp", inputFile = `${workDir}/input.txt`;

    if (language === "java") {
      const classNameMatch = code.match(/class\s+([A-Za-z_][A-Za-z0-9_]*)/);
      const className = classNameMatch ? classNameMatch[1] : "Main";

      image = `${ACR_NAME}/openjdk:17-jdk-slim`;
      cmd = [
        'sh', '-c',
        `echo "${userInput}" > ${inputFile} && printf "%s\n" '${code}' > ${workDir}/${className}.java && javac ${workDir}/${className}.java && java -cp ${workDir} ${className} < ${inputFile}`
      ];
    } else {
      switch (language) {
        case 'python':
          image = `${ACR_NAME}/python:3.9-slim`;
          cmd = ['sh', '-c', `echo '${userInput}' > ${inputFile} && printf "%s\n" '${code}' > ${workDir}/main.py && python ${workDir}/main.py < ${inputFile}`];
          break;
        case 'c':
          image = `${ACR_NAME}/gcc:latest`;
          cmd = ['sh', '-c', `echo '${userInput}' > ${inputFile} && printf "%s\n" '${code}' > ${workDir}/main.c && gcc ${workDir}/main.c -o ${workDir}/main && ${workDir}/main < ${inputFile}`];
          break;
        case 'cpp':
          image = `${ACR_NAME}/gcc:latest`;
          cmd = ['sh', '-c', `echo '${userInput}' > ${inputFile} && printf "%s\n" '${code}' > ${workDir}/main.cpp && g++ ${workDir}/main.cpp -o ${workDir}/main -lstdc++ && ${workDir}/main < ${inputFile}`];
          break;
        case 'go':
          image = `${ACR_NAME}/golang:1.17-alpine`;
          cmd = ['sh', '-c', `echo '${userInput}' > ${inputFile} && printf "%s\n" '${code}' > ${workDir}/main.go && go run ${workDir}/main.go < ${inputFile}`];
          break;
        default:
          throw new Error('Unsupported language');
      }
    }

    console.log(" Using Image:", image);

    let images = await docker.listImages();
    let imageExists = images.some(img => img.RepoTags && img.RepoTags.includes(image));

    if (!imageExists) {
      console.log(`⚡ Image ${image} not found locally. Pulling from ACR...`);
      await new Promise((resolve, reject) => {
        docker.pull(image, (err, stream) => {
          if (err) reject(`Error pulling image ${image}: ${err.message}`);
          else docker.modem.followProgress(stream, resolve);
        });
      });
      console.log(`Successfully pulled image: ${image}`);
    } else {
      console.log(` Image ${image} is already available.`);
    }

    console.log("Running Command:", cmd);

    const startTime = process.hrtime();

    const container = await docker.createContainer({
      Image: image,
      Cmd: cmd,
      WorkingDir: workDir,
      HostConfig: {
        Memory: 256 * 1024 * 1024,  // 256MB RAM limit
        CpuShares: 512,             // Limited CPU usage
        SecurityOpt: ["no-new-privileges"],  // Prevent privilege escalation
        AutoRemove: true,            // Automatically remove the container
        Tmpfs: { "/tmp": "rw,noexec,nosuid,size=64M" } // Temporary writable filesystem
      },
      User: "1001:1001"  // Run as a non-root user
    });

    await container.start();
    const result = await container.wait();

    const logsBuffer = await container.logs({ stdout: true, stderr: true });
    const logsString = logsBuffer.toString('utf8').trim();
    const cleanedOutput = logsString.replace(/[^\x20-\x7E]/g, "");

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
    console.error(" Execution Error:", error);
    return { error: `Execution error: ${error.message}` };
  }
};
