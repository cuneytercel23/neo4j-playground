const neo4j = require("neo4j-driver");

require("dotenv").config();

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

//Distinct eksik 

//Not Get kısımını(nasıl get edildiğini -> result.records ile) getUserbyId kısımında açıkladım.
// Müzik kısımda eğer albümid veya userId verilmemişse ilişki kurma diyorum
//getUserrelatsihonshipli kısımda da müziklerle birlikte çekiyorum.

//WITH İki aşama olduğunu düşün , diğer aşamaya veri geçişini sağlıyor olmasa da olurmuş da öyle işte.
// DETACH Seçilen şeyin tüm ilişkilerini sil.

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
                    artistName: $name
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
    console.log("update user");
    try {
      const result = await session.run(
        `
            MATCH (u:User {id: $id})
            SET u.artistName = $name
            RETURN u
            `,
        { ...user }
      );

      result ? resolve(result) : reject("Error");
    } catch (error) {
      console.log("User Update Error", error);
      reject(error);
    }
  });
};

// 1 user bul
// 2 album bul
// 2 music oluştur
// 3 with ile yukarıdaki user ve musik ve albumü ve IS_Owner ve Is_Song ilişkisi(düğümü) kur.

const createMusic = async (music) => {
  return new Promise(async (resolve, reject) => {
    try {
      const currentSession = driver.session();

      // Eksik parametreler için varsayılan değerler ayarlayın
      console.log(music);
      const params = {
        id: music.id,
        userId: music.userId ?? null,
        name: music.name,
        // albumId eksikse null olarak ayarlayın
        albumId: music.albumId || null,
      };

      const result = await currentSession.run(
        `CREATE (m:Music {id: $id, musicName: $name})
        WITH m
        ${
          params.userId
            ? "MATCH (u:User {id: $userId}) WITH m, u CREATE (u)-[:IS_OWNER]->(m)"
            : "WITH m"
        }
        ${
          params.albumId
            ? "MATCH (a:Album {id: $albumId}) WITH m, a CREATE (m)-[:CONTAINS]->(a)"
            : ""
        }
        RETURN m`,
        { ...params }
      );

      result ? resolve(result) : reject("Error");
    } catch (error) {
      console.log("Music Create Error", error);
      reject(error);
    }
  });
};

// müziği bul, detach et -> bütün ilişkilerini sil.
const deleteMusic = async (musicId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const currentSession = driver.session();
      console.log("musicDelete", musicId);
      const result = await currentSession.run(
        `
              MATCH (m:Music {id: $id})
              DETACH DELETE m`,
        { id: musicId }
      );

      result ? resolve(result) : reject("Error");
    } catch (error) {
      console.log("delete music", error);
      reject(error);
    }
  });
};

const updateMusic = async (music) => {
  return new Promise(async (resolve, reject) => {
    console.log("update music");
    try {
      const result = await session.run(
        `
            MATCH (m:Music {id: $id})
            SET m.musicName = $name
            RETURN m
            `,
        { ...music }
      );

      result ? resolve(result) : reject("Error");
    } catch (error) {
      console.log("Music Update Error", error);
      reject(error);
    }
  });
};

const createAlbum = async (album) => {
  return new Promise(async (resolve, reject) => {
    try {
      const currentSession = driver.session();
      const result = await currentSession.run(
        `
            CREATE (a: Album 
                {
                    id: $id, 
                    albumName: $name,
                })
                `,
        { ...album }
      );

      result ? resolve(result) : reject("Error");
    } catch (error) {
      console.log("album Error", error);
      reject(error);
    }
  });
};

// delete albüme gerek yok.

// get routeleri

const getUserById = async (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const session = driver.session();
      const result = await session.run(
        `MATCH (user:User {id: $id})
         RETURN user`,
        { id: userId }
      );
      console.log(result);

      // bu şekilde alabiliyoruz 1 kişilik cevap alabiliyoruz, sadece bi kaç parametre istersek propertiesin sonuna ekleyerek alabiliriz.
      const user = result.records[0].get("user").properties;

      // result.records[0] ile aşağıdaki json dönüyor
      // {
      //     "keys": [
      //       "user"
      //   ],
      //   "length": 1,
      //   "_fields": [
      //       {
      //           "identity": 0,
      //           "labels": [
      //               "User"
      //           ],
      //           "properties": {
      //               "artistName": "cüneytgüncel",
      //               "id": "123"
      //           },
      //           "elementId": "4:75b4a4e9-4c31-426b-aaf1-acc8b344bb2d:0"
      //       }
      //   ],
      //   "_fieldLookup": {
      //       "user": 0
      //   }
      // }

      // buda çoklu alım
      // const user = result.records.map(
      //   (record) => record.get("user").properties
      // );

      result.records.length > 0 ? resolve(user) : reject("User not found");
    } catch (error) {
      console.log("Error fetching user", error);
      reject(error);
    }
  });
};

const getUserWithRelationshipsById = async (userId) => {
  return new Promise(async (resolve, reject) => {
    const session = driver.session();
    try {
      // Kullanıcıyı getir
      const userResult = await session.run(
        `MATCH (user:User {id: $id})
         RETURN user`,
        { id: userId }
      );

      // Müzikleri getir
      const musicResult = await session.run(
        `MATCH (user:User {id: $id})-[:IS_OWNER]->(music:Music)
         RETURN music`,
        { id: userId }
      );

      const user = userResult.records.length > 0 ? userResult.records[0].get("user").properties : null;
      const musics = musicResult.records.map(record => record.get("music").properties);

      if (user) {
        resolve({ user, musics });
      } else {
        reject("User not found");
      }
    } catch (error) {
      console.log("Error fetching user and musics", error);
      reject(error);
    } finally {
      await session.close();
    }
  });
};


const getMusicById = async (musicId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const session = driver.session();
      const result = await session.run(
        `MATCH (music:Music {id: $id})
         RETURN music`,
        { id: musicId }
      );
      const music = result.records.map(
        (record) => record.get("music").properties
      );
      result.records.length > 0 ? resolve(music) : reject("Music not found");
    } catch (error) {
      console.log("Error fetching music", error);
      reject(error);
    }
  });
};

const getAllMusics = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const session = driver.session();
      const result = await session.run(
        `MATCH (music:Music)
         OPTIONAL MATCH (music)-[:Is_Song]->(album:Album)
         RETURN music, collect(album) as albums`
      );
      const musics = result.records.map((record) => ({
        music: record.get("music").properties,
        albums: record.get("albums").map((album) => album.properties),
      }));
      resolve(musics);
    } catch (error) {
      console.log("Error fetching musics", error);
      reject(error);
    }
  });
};

const getAlbumById = async (albumId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const session = driver.session();
      const result = await session.run(
        `MATCH (album:Album {id: $id})
         RETURN album`,
        { id: albumId }
      );
      const album = result.records.map(
        (record) => record.get("album").properties
      );
      result.records.length > 0 ? resolve(album) : reject("Album not found");
    } catch (error) {
      console.log("Error fetching album", error);
      reject(error);
    }
  });
};

const getAllAlbums = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const session = driver.session();
      const result = await session.run(
        `MATCH (album:Album)
         OPTIONAL MATCH (album)<-[:Is_Song]-(music:Music)
         RETURN album, collect(music) as musics`
      );
      const albums = result.records.map((record) => ({
        album: record.get("album").properties,
        musics: record.get("musics").map((music) => music.properties),
      }));
      resolve(albums);
    } catch (error) {
      console.log("Error fetching albums", error);
      reject(error);
    }
  });
};

module.exports = {
  session,
  createMusic,
  createAlbum,
  createUser,
  updateMusic,
  updateUser,
  getAlbumById,
  getAllAlbums,
  getUserWithRelationshipsById,
  getAllMusics,
  getMusicById,
  getUserById,
  deleteMusic,
  deleteUser,
};
