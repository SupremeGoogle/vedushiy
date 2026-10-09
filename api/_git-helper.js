import fs from 'fs';
import path from 'path';

// Если заданы GITHUB_TOKEN и GITHUB_REPO — пишем в репозиторий (Vercel, Layero и любой хостинг
// с эфемерным диском: новый коммит запускает передеплой). Иначе — на локальный диск (npm run dev).
const useGitHub = !!(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);

// Вспомогательные функции для работы с файлами (Локально vs GitHub)
export async function getFile(filePath) {
  if (!useGitHub) {
    // Локальное чтение
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      return { content: '', sha: null };
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    return { content, sha: null };
  } else {
    // Чтение с GitHub
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';
    const token = process.env.GITHUB_TOKEN;
    
    const url = `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${branch}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Vercel-Git-CMS'
        }
      });
      
      if (response.status === 404) {
        return { content: '', sha: null };
      }
      
      if (!response.ok) {
        throw new Error(`GitHub GET error ${response.status}: ${await response.text()}`);
      }
      
      const data = await response.json();
      // Декодируем base64 контент от GitHub
      const decodedContent = Buffer.from(data.content, 'base64').toString('utf8');
      return { content: decodedContent, sha: data.sha };
    } catch (error) {
      console.error(`Ошибка при чтении с GitHub (${filePath}):`, error.message);
      throw error;
    }
  }
}

export async function saveFile(filePath, content, commitMessage = 'Update file via Admin Panel') {
  if (!useGitHub) {
    // Локальная запись
    const fullPath = path.join(process.cwd(), filePath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, content, 'utf8');
    return { success: true };
  } else {
    // Запись на GitHub
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';
    const token = process.env.GITHUB_TOKEN;
    
    // Сначала получаем SHA существующего файла (если он есть)
    const { sha } = await getFile(filePath);
    
    const url = `https://api.github.com/repos/${repo}/contents/${filePath}`;
    const base64Content = Buffer.from(content, 'utf8').toString('base64');
    
    const body = {
      message: commitMessage,
      content: base64Content,
      branch
    };
    
    if (sha) {
      body.sha = sha;
    }
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Vercel-Git-CMS'
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error(`GitHub PUT error ${response.status}: ${await response.text()}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error(`Ошибка при сохранении на GitHub (${filePath}):`, error.message);
      throw error;
    }
  }
}

async function githubApi(apiPath, options = {}) {
  const repo = process.env.GITHUB_REPO;
  const response = await fetch(`https://api.github.com/repos/${repo}${apiPath}`, {
    ...options,
    headers: {
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'Vercel-Git-CMS'
    }
  });
  if (!response.ok) {
    const error = new Error(`GitHub ${options.method || 'GET'} ${apiPath} error ${response.status}: ${await response.text()}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

// Загрузка одного файла (Buffer) БЕЗ коммита: на GitHub создаётся blob, коммит делает commitFiles.
// Так каждый файл идёт отдельным небольшим запросом, а сайт передеплоится один раз за сохранение.
export async function uploadBlob(filePath, buffer) {
  if (!useGitHub) {
    const fullPath = path.join(process.cwd(), filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, buffer);
    return { path: filePath, sha: null };
  }
  const blob = await githubApi('/git/blobs', {
    method: 'POST',
    body: JSON.stringify({ content: buffer.toString('base64'), encoding: 'base64' })
  });
  return { path: filePath, sha: blob.sha };
}

// Один коммит с набором файлов: [{ path, content }] (текст) или [{ path, sha }] (загруженный blob)
export async function commitFiles(files, commitMessage) {
  if (!useGitHub) {
    for (const file of files) {
      if (file.content === undefined) continue; // бинарные файлы уже записаны в uploadBlob
      const fullPath = path.join(process.cwd(), file.path);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, file.content, 'utf8');
    }
    return { success: true };
  }

  const branch = process.env.GITHUB_BRANCH || 'main';
  const tree = files.map(file => file.content !== undefined
    ? { path: file.path, mode: '100644', type: 'blob', content: file.content }
    : { path: file.path, mode: '100644', type: 'blob', sha: file.sha });

  // Повторяем, если кто-то (например, бот) успел закоммитить в ветку между чтением и записью
  for (let attempt = 1; ; attempt++) {
    const ref = await githubApi(`/git/ref/heads/${branch}`);
    const parent = await githubApi(`/git/commits/${ref.object.sha}`);
    const newTree = await githubApi('/git/trees', {
      method: 'POST',
      body: JSON.stringify({ base_tree: parent.tree.sha, tree })
    });
    const commit = await githubApi('/git/commits', {
      method: 'POST',
      body: JSON.stringify({ message: commitMessage, tree: newTree.sha, parents: [ref.object.sha] })
    });
    try {
      await githubApi(`/git/refs/heads/${branch}`, {
        method: 'PATCH',
        body: JSON.stringify({ sha: commit.sha })
      });
      return { success: true };
    } catch (error) {
      if (error.status !== 422 || attempt >= 3) throw error;
    }
  }
}
