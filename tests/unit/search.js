const Fuse = require("fuse.js");

function search(data, term) {
  const fuse = new Fuse(data, {
    keys: ["Generic Name", "Brand", "FUKKM System/Group"],
    threshold: 0.3,
  });
  return fuse.search(term);
}

module.exports = { search };
