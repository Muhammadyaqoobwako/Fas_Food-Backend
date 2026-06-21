const fs = require('fs');
const path = require('path');

const DB_DIR = path.resolve(__dirname, '../database');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// In-memory registry of models
const modelsRegistry = {};

class Schema {
  constructor(definition, options) {
    this.definition = definition;
    this.options = options;
    this._hooks = { pre: {}, post: {} };
    this.methods = {};
  }

  pre(event, fn) {
    if (!this._hooks.pre[event]) {
      this._hooks.pre[event] = [];
    }
    this._hooks.pre[event].push(fn);
  }

  index() {
    // No-op for mock index
  }
}

function generateId() {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

function loadData(modelName) {
  const filePath = path.join(DB_DIR, `${modelName.toLowerCase()}.json`);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    console.error(`Error reading mock DB for ${modelName}:`, e.message);
    return [];
  }
}

function saveData(modelName, data) {
  const filePath = path.join(DB_DIR, `${modelName.toLowerCase()}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`Error writing mock DB for ${modelName}:`, e.message);
  }
}

function getPreHooks(schemaInstance, eventName) {
  const hooks = [];
  if (schemaInstance && schemaInstance.s && schemaInstance.s.hooks) {
    const list = schemaInstance.s.hooks._pres.get(eventName);
    if (list && Array.isArray(list)) {
      list.forEach(item => {
        // Skip Mongoose's internal pre-save hooks (like validateBeforeSave, saveSubdocsPreSave, timestampsPreSave, shardingPluginPreSave, trackTransactionPreSave)
        const fnName = item.fn.name;
        if (fnName && (
          fnName.includes('validateBeforeSave') || 
          fnName.includes('saveSubdocsPreSave') || 
          fnName.includes('timestampsPreSave') || 
          fnName.includes('shardingPluginPreSave') || 
          fnName.includes('trackTransactionPreSave')
        )) {
          return;
        }
        hooks.push(item.fn);
      });
    }
  }
  
  if (schemaInstance && schemaInstance._hooks && schemaInstance._hooks.pre && schemaInstance._hooks.pre[eventName]) {
    hooks.push(...schemaInstance._hooks.pre[eventName]);
  }
  
  return hooks;
}

function createModel(modelName, schema) {
  if (modelsRegistry[modelName]) {
    return modelsRegistry[modelName];
  }

  class Model {
    constructor(data) {
      Object.assign(this, data);
      if (!this._id) {
        this._id = generateId();
      }

      // Copy methods from schema.methods to instance
      if (schema && schema.methods) {
        for (const [name, fn] of Object.entries(schema.methods)) {
          this[name] = fn.bind(this);
        }
      }

      // Mock isModified method for pre-save hooks
      this.isModified = (field) => {
        return true;
      };
    }

    async save() {
      // Run pre-validate hooks
      const preValidate = getPreHooks(schema, 'validate');
      for (const hook of preValidate) {
        await new Promise((resolve, reject) => {
          hook.call(this, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      // Run pre-save hooks
      const preSave = getPreHooks(schema, 'save');
      for (const hook of preSave) {
        await new Promise((resolve, reject) => {
          hook.call(this, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      // Add timestamps
      if (schema && schema.options && schema.options.timestamps) {
        const now = new Date();
        if (!this.createdAt) this.createdAt = now;
        this.updatedAt = now;
      }

      const records = loadData(modelName);
      const index = records.findIndex(r => r._id === this._id);
      
      const serialized = JSON.parse(JSON.stringify(this));

      // Remove functions/mock helpers before serializing
      delete serialized.isModified;
      if (schema && schema.methods) {
        for (const name of Object.keys(schema.methods)) {
          delete serialized[name];
        }
      }

      if (index >= 0) {
        records[index] = serialized;
      } else {
        records.push(serialized);
      }

      saveData(modelName, records);
      return this;
    }

    // Static Query methods
    static find(query = {}) {
      const records = loadData(modelName);
      
      // Basic query filter
      let filtered = records.filter(r => {
        for (const [key, val] of Object.entries(query)) {
          if (key === '_id') {
            if (String(r._id) !== String(val)) return false;
          } else {
            if (r[key] !== val) return false;
          }
        }
        return true;
      });

      // Wrap results in query chain
      const chain = {
        then: (onresolve) => Promise.resolve(filtered.map(r => new Model(r))).then(onresolve),
        sort: (sortObj) => {
          const key = Object.keys(sortObj)[0];
          const dir = sortObj[key];
          filtered.sort((a, b) => {
            if (a[key] < b[key]) return dir === 1 ? -1 : 1;
            if (a[key] > b[key]) return dir === 1 ? 1 : -1;
            return 0;
          });
          return chain;
        }
      };

      // Make query chain thenable
      chain.catch = (onreject) => Promise.resolve(filtered.map(r => new Model(r))).catch(onreject);
      return chain;
    }

    static async findOne(query = {}) {
      const records = loadData(modelName);
      const found = records.find(r => {
        for (const [key, val] of Object.entries(query)) {
          if (key === '_id') {
            if (String(r._id) !== String(val)) return false;
          } else {
            if (r[key] !== val) return false;
          }
        }
        return true;
      });
      return found ? new Model(found) : null;
    }

    static async findById(id) {
      return this.findOne({ _id: id });
    }

    static async findByIdAndDelete(id) {
      const records = loadData(modelName);
      const index = records.findIndex(r => String(r._id) === String(id));
      if (index === -1) return null;
      const deleted = records.splice(index, 1)[0];
      saveData(modelName, records);
      return new Model(deleted);
    }

    static async findByIdAndUpdate(id, update, options = {}) {
      const records = loadData(modelName);
      const index = records.findIndex(r => String(r._id) === String(id));
      if (index === -1) {
        console.warn(`[MongooseMock] findByIdAndUpdate failed: ID ${id} (type: ${typeof id}) not found in ${modelName}. Available IDs:`, records.map(r => r._id));
        return null;
      }

      // Extract update fields (supporting both direct and $set)
      const updateData = update.$set || update;
      records[index] = { ...records[index], ...updateData, updatedAt: new Date() };
      
      saveData(modelName, records);
      return new Model(records[index]);
    }

    static async insertMany(arr) {
      const records = loadData(modelName);
      const created = [];
      for (const item of arr) {
        const inst = new Model(item);
        // Run pre-save hooks
        const preSave = getPreHooks(schema, 'save');
        for (const hook of preSave) {
          await new Promise((resolve, reject) => {
            hook.call(inst, (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        }
        if (schema && schema.options && schema.options.timestamps) {
          const now = new Date();
          inst.createdAt = now;
          inst.updatedAt = now;
        }
        created.push(JSON.parse(JSON.stringify(inst)));
      }
      records.push(...created);
      saveData(modelName, records);
      return created.map(r => new Model(r));
    }

    static async countDocuments(query = {}) {
      const records = loadData(modelName);
      const filtered = records.filter(r => {
        for (const [key, val] of Object.entries(query)) {
          if (r[key] !== val) return false;
        }
        return true;
      });
      return filtered.length;
    }
  }

  modelsRegistry[modelName] = Model;
  return Model;
}

function applyOverride(mongooseInstance) {
  console.log('Overriding Mongoose singleton with file-based mock database...');

  // Override connection
  mongooseInstance.connect = async () => {
    console.log('Using Offline Mock Mongoose Database.');
    return { connection: { name: 'mock_json_db' } };
  };
  mongooseInstance.disconnect = async () => {};

  // Override Model static query methods
  const staticMethods = [
    'find', 'findOne', 'findById', 'findByIdAndDelete', 'findByIdAndUpdate', 'insertMany', 'countDocuments'
  ];

  staticMethods.forEach(method => {
    mongooseInstance.Model[method] = function(...args) {
      const modelName = this.modelName;
      const MockModelClass = createModel(modelName, this.schema);
      return MockModelClass[method].apply(MockModelClass, args);
    };
  });

  // Override Model instance save method
  mongooseInstance.Model.prototype.save = async function() {
    const modelName = this.constructor.modelName;
    const MockModelClass = createModel(modelName, this.schema);
    
    // Convert document to regular object
    const docObj = this.toObject ? this.toObject() : JSON.parse(JSON.stringify(this));
    const mockInst = new MockModelClass(docObj);
    const saved = await mockInst.save();
    
    // Copy generated fields back
    Object.assign(this, saved);
    return this;
  };
}

module.exports = {
  Schema,
  model: createModel,
  connect: async () => {
    return { connection: { name: 'mock_json_db' } };
  },
  disconnect: async () => {},
  applyOverride
};
