const LEADING_MARKER = /^(?:\u2022|\*|-|\u2013|\u2014)\s*/;
const KNOWN_LINK_PREFIX =
  /^(?:github|gitlab|demo|live|website|site|portfolio|code|repository|repo|case study|prototype|video|link)\s*:/i;
const LABELED_URL = /^[a-z][a-z ]{0,24}:\s*(?:https?:\/\/|www\.)/i;

type EntryKind = 'achievement' | 'link';

interface ProjectEntry {
  kind: EntryKind;
  text: string;
}

interface Project {
  heading: string;
  entries: ProjectEntry[];
}

function normalizeLine(line: string): string {
  return line.replace(/[^\S\r\n]+/g, ' ').trim();
}

function appendText(current: string, addition: string): string {
  return normalizeLine(`${current} ${addition}`);
}

function isLinkText(text: string): boolean {
  return KNOWN_LINK_PREFIX.test(text) || LABELED_URL.test(text);
}

function classifyLine(line: string): { kind: 'plain' | EntryKind; text: string } {
  const marker = line.match(LEADING_MARKER);
  const text = marker ? line.slice(marker[0].length).trim() : line;

  if (isLinkText(text)) {
    return { kind: 'link', text };
  }

  if (marker) {
    return { kind: 'achievement', text };
  }

  return { kind: 'plain', text };
}

function looksLikeLinkContinuation(line: string, currentLink: string): boolean {
  if (/^(?:https?:\/\/|www\.)/i.test(line)) {
    return true;
  }

  const linkValue = currentLink.replace(KNOWN_LINK_PREFIX, '').trim();

  if (!linkValue) {
    return true;
  }

  return (
    !/\s/.test(line) &&
    /^[a-z0-9./?%&=+#:@_~-]+$/i.test(line) &&
    /[./?%&=+#@_~-]/.test(line)
  );
}

export function convertProjectText(value: string): string {
  const lines = value
    .replace(/\r\n?/g, '\n')
    .replace(/\f/g, '\n\n')
    .split('\n')
    .map(normalizeLine);

  const projects: Project[] = [];
  let project: Project | null = null;
  let activeEntry: ProjectEntry | null = null;
  let sawBlankLine = false;

  function startProject(heading = '') {
    project = { heading, entries: [] };
    activeEntry = null;
  }

  function finishProject() {
    if (project && (project.heading || project.entries.length > 0)) {
      projects.push(project);
    }

    project = null;
    activeEntry = null;
  }

  for (const line of lines) {
    if (!line) {
      sawBlankLine = true;
      continue;
    }

    const classified = classifyLine(line);

    if (!project && classified.kind === 'plain') {
      startProject(classified.text);
      sawBlankLine = false;
      continue;
    }

    if (!project) {
      project = { heading: '', entries: [] };
      activeEntry = null;
    }

    const currentProject = project;

    if (classified.kind !== 'plain') {
      const entry: ProjectEntry = {
        kind: classified.kind,
        text: classified.text,
      };

      currentProject.entries.push(entry);
      activeEntry = entry;
      sawBlankLine = false;
      continue;
    }

    if (currentProject.entries.length === 0) {
      currentProject.heading = appendText(currentProject.heading, classified.text);
      sawBlankLine = false;
      continue;
    }

    if (
      activeEntry?.kind === 'link' &&
      looksLikeLinkContinuation(classified.text, activeEntry.text)
    ) {
      activeEntry.text = appendText(activeEntry.text, classified.text);
      sawBlankLine = false;
      continue;
    }

    if (sawBlankLine || activeEntry?.kind === 'link') {
      finishProject();
      startProject(classified.text);
      sawBlankLine = false;
      continue;
    }

    if (activeEntry) {
      activeEntry.text = appendText(activeEntry.text, classified.text);
    }

    sawBlankLine = false;
  }

  finishProject();

  return projects
    .map(({ heading, entries }) => {
      const output = [
        heading,
        ...entries.filter(({ text }) => text).map(({ text }) => `- ${text}`),
      ].filter(Boolean);

      return output.join('\n');
    })
    .filter(Boolean)
    .join('\n\n')
    .trim();
}
