const neo4j = require("neo4j-driver");

// ip , username, password
const driver = neo4j.driver(
  process.env.NEO4J_URL ?? "localhost",
  neo4j.auth.basic(
    process.env.NEO4J_USERNAME ?? "neo4j",
    process.env.NEO4J_PASSWORD ?? "neo4j"
  ),
  { disableLosslessIntegers: true }
);

const session = driver.session();

//WITH İki aşama olduğunu düşün , diğer aşamaya veri geçişini sağlıyor olmasa da olurmuş da öyle işte.

// cypher koddaki key = db'deki parametre, "$"" ile verdiğimiz bizim parametrelerimiz.
//const user = {
//     id: 123,
//     name: 'Hadise Açıkgöz',
//     diğer özellikler...
//   };
// {...user } yaparak, bir {}'in içine user'ı basmış oluyoruz.
const createUser = async (user) => {
  return new Promise(async (resolve, reject) => {
    try {
      const currentSession = driver.session();
      const result = await currentSession.run(
        `
            CREATE (user: User 
                {
                    id: $id, 
                    artistName: $name,
                })
                `,
        { ...user }
      );

      result ? resolve(result) : reject("Error");
    } catch (error) {
      console.log("User Error", error);
      reject(error);
    }
  });
};

// cypher koddaki key = db'deki parametre, "$"" ile verdiğimiz bizim parametrelerimiz.
// {...user } yaparak, bir {}'in içine user'ı basmış oluyoruz.
// delete bildiğim gibi silme, detach ise diğer bütün ilişkileri(düğümleri) kesiyor güzel özellik.
const deleteUser = async (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const currentSession = driver.session();
      console.log("userDelete", userId);
      const result = await currentSession.run(
        `
            MATCH (user:User {id: $id})
            DETACH DELETE user`,
        { id: userId }
      );

      result ? resolve(result) : reject("Error");
    } catch (error) {
      console.log("delete user", error);
      reject(error);
    }
  });
};


//const user = {
//     id: 123,
//     name: 'Hadise Açıkgöz',
//     diğer özellikler...
//   };
// {...user } yaparak, bir {}'in içine user'ı basmış oluyoruz.
const updateUser = async (user) => {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await session.run(`
            MATCH (u:Permission {id: $id})
            SET u.artistName = $name
            RETURN u
            `, { ...user });

            result ? resolve(result) : reject("Error");
        } catch (error) {
            console.log(error)
            reject(error);
        }
    });
};




