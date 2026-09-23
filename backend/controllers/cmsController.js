const PageContent = require('../models/PageContent');
const { DEFAULT_PAGE_CONTENTS, seedDefaultsIfNeeded } = require('../utils/seedDefaults');

async function getAllContent(req, res) {
  try {
    const contents = await PageContent.find().sort({ page: 1, sortOrder: 1 });
    const kv_map = {};
    for (const c of contents) {
      kv_map[c.sectionKey] = c.content;
    }
    return res.status(200).json({
      status: 'success',
      data: kv_map,
      items: contents.map(c => c.toJSON())
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}

async function getGroupedContent(req, res) {
  try {
    const contents = await PageContent.find().sort({ page: 1, sortOrder: 1 });
    const grouped = {};
    for (const c of contents) {
      if (!grouped[c.page]) {
        grouped[c.page] = [];
      }
      grouped[c.page].push(c.toJSON());
    }
    return res.status(200).json({
      status: 'success',
      data: grouped
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}

async function updateContent(req, res) {
  try {
    const { section_key } = req.params;
    const data = req.body || {};

    const item = await PageContent.findOne({ sectionKey: section_key });
    if (!item) {
      return res.status(404).json({ status: 'error', message: 'Content key not found' });
    }

    if (data.content !== undefined) item.content = data.content;
    if (data.label !== undefined) item.label = data.label;

    await item.save();
    return res.status(200).json({ status: 'success', data: item.toJSON() });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}

async function batchUpdateContent(req, res) {
  try {
    const data = req.body || {};
    const updates = data.updates || data;
    let updatedCount = 0;

    if (Array.isArray(updates)) {
      for (const row of updates) {
        const k = row.sectionKey;
        const v = row.content;
        if (k && v !== undefined && v !== null) {
          const item = await PageContent.findOne({ sectionKey: k });
          if (item) {
            item.content = String(v);
            await item.save();
            updatedCount++;
          }
        }
      }
    } else if (typeof updates === 'object' && updates !== null) {
      for (const [k, v] of Object.entries(updates)) {
        if (v !== undefined && v !== null) {
          const item = await PageContent.findOne({ sectionKey: k });
          if (item) {
            item.content = String(v);
            await item.save();
            updatedCount++;
          }
        }
      }
    }

    return res.status(200).json({
      status: 'success',
      message: `Successfully updated ${updatedCount} dynamic text elements`,
      updatedCount
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}

async function resetDefaultContent(req, res) {
  try {
    for (const item of DEFAULT_PAGE_CONTENTS) {
      const existing = await PageContent.findOne({ sectionKey: item.sectionKey });
      if (existing) {
        existing.content = item.content;
        existing.label = item.label;
        existing.contentType = item.contentType;
        existing.sortOrder = item.sortOrder;
        await existing.save();
      } else {
        await PageContent.create(item);
      }
    }

    return res.status(200).json({
      status: 'success',
      message: 'All headings and paragraphs restored to defaults successfully'
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
}

module.exports = {
  getAllContent,
  getGroupedContent,
  updateContent,
  batchUpdateContent,
  resetDefaultContent
};
