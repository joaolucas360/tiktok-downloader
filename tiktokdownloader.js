import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const linksPath = path.join(__dirname, "links.txt");
const archivePath = path.join(__dirname, "baixados.txt");
const outputDir = path.join(__dirname, "videos");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

if (!fs.existsSync(linksPath)) {
  console.log("❌ links.txt não encontrado. Crie o arquivo e adicione os links, um por linha.");
  process.exit(1);
}

const links = fs
  .readFileSync(linksPath, "utf-8")
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean)
  .filter((l) => {
    try {
      const url = new URL(l);
      return url.hostname.includes("tiktok.com");
    } catch {
      console.log(`⚠️  Link ignorado (inválido): ${l}`);
      return false;
    }
  });

if (links.length === 0) {
  console.log("❌ Nenhum link válido do TikTok encontrado em links.txt.");
  process.exit(0);
}

console.log(`\n🎵 ${links.length} link(s) encontrado(s). Baixando...\n`);

const args = [
  "--cookies-from-browser", "chrome",
  "--no-update",
  "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best",
  "--merge-output-format", "mp4",
  "--download-archive", archivePath,
  "-o", `${outputDir}/%(upload_date)s_%(id)s.%(ext)s`,
  ...links,
];

const skipLine = (line) => {
  const ruido = [
    "Extracting cookies",
    "Extracted ",
    "Solving JS challenge",
    "Downloading webpage",
    "WARNING: Your yt-dlp version",
    "It is strongly recommended",
    "You installed yt-dlp",
    "To suppress this warning",
  ];
  return ruido.some((r) => line.includes(r));
};

const processo = spawn("yt-dlp", args, { stdio: ["ignore", "pipe", "pipe"] });

processo.stdout.on("data", (data) => {
  data.toString().split("\n").forEach((line) => {
    if (!line.trim() || skipLine(line)) return;

    if (line.includes("[download]") && line.includes("%")) {
      process.stdout.write(`\r  ⬇️  ${line.trim().replace("[download]", "").trim()}`);
    } else if (line.includes("[download] Destination:")) {
      const nome = path.basename(line.split("Destination:")[1].trim());
      console.log(`  📁 Salvando: ${nome}`);
    } else if (line.includes("[info]") || line.includes("[TikTok]")) {
      return;
    } else {
      console.log(`  ${line.trim()}`);
    }
  });
});

processo.stderr.on("data", (data) => {
  data.toString().split("\n").forEach((line) => {
    if (!line.trim() || skipLine(line)) return;
    console.error(`  ⚠️  ${line.trim()}`);
  });
});

processo.on("close", (code) => {
  if (code === 0) {
    console.log("\n✅ Pronto! Vídeo(s) salvo(s) em videos/\n");
  } else {
    console.log(`\n❌ Algo deu errado (código ${code}). Verifique os erros acima.\n`);
  }
});

processo.on("error", (err) => {
  if (err.code === "ENOENT") {
    console.log("❌ yt-dlp não encontrado. Instale com: pip install yt-dlp");
  } else {
    console.log("❌ Erro inesperado:", err.message);
  }
});
