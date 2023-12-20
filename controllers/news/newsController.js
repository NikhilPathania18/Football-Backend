import uploadFile from "../../helpers/fileUpload.js";
import newsModel from "../../models/News.js";
import mainNews from "../../models/MainNews.js";

const newNews = async (req, res) => {
  try {
    const news = req.body;
    const image = req.file;

    console.log(req.body)
    console.log(req.file)
    if (!news.title) {
      return res.status(400).send({
        success: false,
        message: "Title should not be empty",
      });
    }
    if (!news.paragraphs || news.paragraphs.length === 0) {
      return res.status(400).send({
        success: false,
        message: "Paragraphs should not be empty",
      });
    }

    let imageLink = null
    
    if(image) imageLink = await uploadFile(image);

    console.log('imagelink',imageLink)

    news.date = new Date();

    if(imageLink)
    news.image = imageLink;

    const News = await newsModel.create(news);

    return res.status(200).send({
      success: true,
      message: "News created Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};


const setMainNews = async(req,res) => {
    try {
        const {id} = req.params;

        if(!id) return res.status(400).send({
            success: false,
            message: 'Invalid news id'
        })

        const existingMainNews = await mainNews.find({})

        if(existingMainNews.length!==0){
            existingMainNews[0].news = id
            await existingMainNews[0].save();
        }
        else{
          await mainNews.create({
            news: id
          })
        }

        return res.status(200).send({
          success: true,
          message: 'Main News set successfully'
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success: false,
            message: 'Internal Server Error'
        })
    }
}

const deleteNews = async(req,res) => {
  try {
    const {id} = req.params;

    if(!id) return res.status(404).send({
      success: false,
      message: 'Id empty'
    })

    const news = newsModel.findById(id)

    if(!news) return res.status(400).send({
      success: false,
      message: 'Invalid News ID'
    })

    await newsModel.findByIdAndDelete(id)

    return res.status(200).send({
      success: true,
      message: 'News deleted Successfully'
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      success: false,
      message: 'Internal Server Error'
    })
  }
}

const getTopNews = async (req, res) => {
  try {
    const news = await newsModel.find({}).sort({ date: -1 }).limit(6);

    const topNewsResult = await mainNews.find({}).populate('news');
    const topNews = topNewsResult.length !== 0 ? topNewsResult[0].news : null;

    let data = {
      topNews: topNews,
      news: [],
    };

    news.forEach((element) => {
      if (
        data.news.length < 5 &&
        (!topNews || !topNews._id.equals(element._id))
      ) {
        data.news.push(element);
      }
    });

    return res.status(200).send({
      success: true,
      message: 'News fetched successfully',
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

export const getNewsById = async(req,res) => {
  try {
    const {id} = req.params;
    const news = await newsModel.findById(id);

    if(!news) return res.status(404).send({
      success: false,
      message: "News not found"
    })

    return res.status(200).send({
      success: true,
      message: 'News fetched',
      news
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      success: false,
      message: 'Internal Server Error'
    })
  }
}

export {newNews, setMainNews, deleteNews, getTopNews}