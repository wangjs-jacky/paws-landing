import { describe, expect, it } from 'vitest';
import { STORY_SCENE_IDS, getStoryContent, storyContent } from '../src/app/storyContent';

function getShape(value) {
  if (Array.isArray(value)) return value.map(getShape);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, getShape(item)]));
  }
  return typeof value;
}

function findEmptyCollections(value, path = 'story') {
  if (Array.isArray(value)) {
    return value.length === 0
      ? [path]
      : value.flatMap((item, index) => findEmptyCollections(item, `${path}[${index}]`));
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value);
    return entries.length === 0
      ? [path]
      : entries.flatMap(([key, item]) => findEmptyCollections(item, `${path}.${key}`));
  }
  return [];
}

describe('cross-device story content', () => {
  it('keeps four stable scenes in the approved order', () => {
    expect(STORY_SCENE_IDS).toEqual(['start', 'watch', 'approve', 'handoff']);
    for (const language of ['en', 'zh']) {
      expect(getStoryContent(language).scenes.map(scene => scene.id)).toEqual(STORY_SCENE_IDS);
    }
  });

  it('keeps English and Chinese object shapes identical', () => {
    expect(getShape(storyContent.en)).toEqual(getShape(storyContent.zh));
    expect(storyContent.en.crew.map(item => item.id)).toEqual(storyContent.zh.crew.map(item => item.id));
    expect(storyContent.en.proof).toHaveLength(6);
    expect(storyContent.zh.comparison).toHaveLength(5);
  });

  it('keeps every story collection populated', () => {
    expect(findEmptyCollections(storyContent.en)).toEqual([]);
    expect(findEmptyCollections(storyContent.zh)).toEqual([]);
  });

  it('includes OpenClaw in the bilingual architecture agent list', () => {
    expect(storyContent.en.architecture.nodes.agents).toBe('Codex / Claude Code / Gemini / OpenCode / OpenClaw / ACP');
    expect(storyContent.zh.architecture.nodes.agents).toBe('Codex / Claude Code / Gemini / OpenCode / OpenClaw / ACP');
  });

  it('marks the Chrome extension as planned and uses qualified Aliyun copy', () => {
    expect(storyContent.zh.roadmap.planned.find(item => item.id === 'chrome-extension')).toBeTruthy();
    expect(storyContent.zh.architecture.note).toContain('底层 Agent');
    expect(storyContent.zh.architecture.note).not.toMatch(/无需\s*VPN/);
  });
});
