const dbConfig = {
  server: "MSI\\MSSQLSERVER01",
  database: "QL_BuonBan",
  driver: "msnodesqlv8",
  options: {
    trustedConnection: true,
  },
};

module.exports = dbConfig;
