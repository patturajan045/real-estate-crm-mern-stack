const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const pageContentSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => uuidv4() },
    page: { type: String, required: true },
    sectionKey: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    content: { type: String, required: true },
    contentType: { type: String, default: 'heading' },
    sortOrder: { type: Number, default: 0 },
    addedTime: { type: Date, default: Date.now },
    updatedTime: { type: Date, default: Date.now }
  },
  {
    collection: 'page_contents',
    timestamps: { createdAt: 'addedTime', updatedAt: 'updatedTime' },
    toJSON: {
      transform: (doc, ret) => {
        return {
          id: String(ret._id),
          page: ret.page,
          sectionKey: ret.sectionKey,
          label: ret.label,
          content: ret.content,
          contentType: ret.contentType,
          sortOrder: ret.sortOrder
        };
      }
    }
  }
);

pageContentSchema.index({ page: 1, sectionKey: 1 });

const PageContent = mongoose.model('PageContent', pageContentSchema);
module.exports = PageContent;
