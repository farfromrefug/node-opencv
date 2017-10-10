#include "OpenCV.h"
#include "Matrix.h"
#include <nan.h>
#include <iostream>

void OpenCV::Init(Local<Object> target)
{
  Nan::HandleScope scope;

  // Version string.
  char out[21];
  int n = sprintf(out, "%i.%i", CV_MAJOR_VERSION, CV_MINOR_VERSION);
  target->Set(Nan::New<String>("version").ToLocalChecked(), Nan::New<String>(out, n).ToLocalChecked());

  Nan::SetMethod(target, "readImage", ReadImage);
  Nan::SetMethod(target, "readImageSync", ReadImageSync);
  Nan::SetMethod(target, "mean", Mean);
}

NAN_METHOD(OpenCV::ReadImage)
{
  Nan::EscapableHandleScope scope;

  REQ_FUN_ARG(1, cb);

  Local<Value> argv[2];
  argv[0] = Nan::Null();

  Local<Object> im_h = Nan::New(Matrix::constructor)->GetFunction()->NewInstance();
  Matrix *img = Nan::ObjectWrap::Unwrap<Matrix>(im_h);
  argv[1] = im_h;

  try
  {
    cv::Mat mat;

    if (info[0]->IsNumber() && info[1]->IsNumber())
    {
      int width, height;

      width = info[0]->Uint32Value();
      height = info[1]->Uint32Value();
      mat = *(new cv::Mat(width, height, CV_64FC1));
    }
    else if (info[0]->IsString())
    {
      std::string filename = std::string(*Nan::Utf8String(info[0]->ToString()));
      mat = cv::imread(filename, CV_LOAD_IMAGE_UNCHANGED);
    }
    else if (Buffer::HasInstance(info[0]))
    {
      uint8_t *buf = (uint8_t *)Buffer::Data(info[0]->ToObject());
      unsigned len = Buffer::Length(info[0]->ToObject());

      cv::Mat *mbuf = new cv::Mat(len, 1, CV_64FC1, buf);
      mat = cv::imdecode(*mbuf, CV_LOAD_IMAGE_UNCHANGED);

      if (mat.empty())
      {
        argv[0] = Nan::Error("Error loading file");
      }
    }

    img->mat = mat;
  }
  catch (cv::Exception &e)
  {
    argv[0] = Nan::Error(e.what());
    argv[1] = Nan::Null();
  }

  Nan::TryCatch try_catch;
  cb->Call(Nan::GetCurrentContext()->Global(), 2, argv);

  if (try_catch.HasCaught())
  {
    Nan::FatalException(try_catch);
  }

  return;
}
NAN_METHOD(OpenCV::ReadImageSync)
{
  Nan::EscapableHandleScope scope;
  Local<Object> im_h = Nan::New(Matrix::constructor)->GetFunction()->NewInstance();
  Matrix *img = Nan::ObjectWrap::Unwrap<Matrix>(im_h);

  try
  {
    cv::Mat mat;
    if (info[0]->IsNumber() && info[1]->IsNumber())
    {
      int width, height;

      width = info[0]->Uint32Value();
      height = info[1]->Uint32Value();
      mat = *(new cv::Mat(width, height, CV_64FC1));
    }
    else if (info[0]->IsString())
    {
      std::string filename = std::string(*Nan::Utf8String(info[0]->ToString()));
      mat = cv::imread(filename, CV_LOAD_IMAGE_UNCHANGED);
    }
    else if (Buffer::HasInstance(info[0]))
    {
      uint8_t *buf = (uint8_t *)Buffer::Data(info[0]->ToObject());
      unsigned len = Buffer::Length(info[0]->ToObject());

      cv::Mat *mbuf = new cv::Mat(len, 1, CV_64FC1, buf);
      mat = cv::imdecode(*mbuf, CV_LOAD_IMAGE_UNCHANGED);

      if (mat.empty())
      {
        Nan::ThrowError("Error loading file");
      }
    }
    img->mat = mat;
    info.GetReturnValue().Set(im_h);
  }
  catch (cv::Exception &e)
  {
    Nan::ThrowError(e.what());
  }
}


NAN_METHOD(OpenCV::Mean) {
  Nan::EscapableHandleScope scope;
  if (!info[0]->IsArray()) {
    Nan::ThrowTypeError("mean requires an array arg");
  }
  int type = -1;
  if (info.Length() > 1) {
    type = info[1]->IntegerValue();
  }
  Local<Array> array = Local<Array>::Cast(info[0]->ToObject());
  int count = array->Length();
  Matrix *currentMat;
  
  cv::Mat resultMat;
  cv::Mat frameConverted;
  for(int i = 0 ; i < count; i++){
    currentMat = Nan::ObjectWrap::Unwrap<Matrix>(array->Get(i)->ToObject());
    if (i == 0) {
      if (type == -1) {
        type = currentMat->mat.type();
      }
      if (currentMat->mat.type() != type) {
        currentMat->mat.convertTo(resultMat,type);
      } else {
        resultMat = currentMat->mat.clone();
      }
    } else {
      if (currentMat->mat.type() != type) {
        currentMat->mat.convertTo(frameConverted,type);
        resultMat += frameConverted;
      } else {
        resultMat += currentMat->mat;
      }
    }
  }
  frameConverted.release();
  resultMat *= (1.0/count);
  Local<Object> result = Nan::New(Matrix::constructor)->GetFunction()->NewInstance();
  Matrix *resultmat = Nan::ObjectWrap::Unwrap<Matrix>(result);
  resultmat->mat = resultMat;
  info.GetReturnValue().Set(result);
}