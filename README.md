
# 动作识别小程序   
## 写在前面

​        今天介绍第二个微信小程序，用以动作识别。这是我们一门课程的期末作业，做完之后一直没再管，今天分享给大家，欢迎各位阅读~

## 小程序介绍


​        首先做一个简单的介绍，本小程序页面非常简单，仅仅做了核心功能，本来打算后期丰富一下，但是一直没什么合适的时间，直到现在也保留原样，于是我就打算这样发出来了，感兴趣的小伙伴可以自己完善一下~

​        总共训练了四个动作，分别是 徒手侧平举、前后交叉小跑、开合跳、半蹲。动作比较简单，准确率个人觉得还可以，二维码在底部，欢迎大家体验 至于这个动作该怎么做，本来是有个视频的，但是出于种种原因.....就不展示了，大家随缘做做~

​        底部有两个按钮，计时模式会倒计时30秒，每2.56秒播报一下当前做的动作，30秒结束在每张图片下方会记录每个动作做的次数（计数这个功能非常水，当时没有认真做，准确率感人，大家随便看看就好了~）。自由模型则没有时间限制，可以自行停止，同样2.56秒播报一下，停止后显示次数。

​        以上就是全部功能，是不是非常简单，甚至简单到都不用介绍。

​        接下来介绍一下各部分是如何实现的。

## 实现过程

> 本程序Python部分共分为数据处理(dataProcessing.py)、模型训练(trainMode.py)和模型应用(model.py)三部分。

### 一、数据处理

#### 1. 包的调用及声明

- python包导入
- 全局变量声明


```python
import json
import numpy as np
from scipy import signal
from scipy import stats
target = []
```

#### 2.原始训练集读取


```python
def readJson(file_name):
     with open(file_name,'r', encoding = 'utf-8') as file:
          data = []
          for line in file.readlines():
               dic = json.loads(line)
               data.append(dic)
     return data
```

#### 3.数据低通滤波


```python
def filtering(data):
    b, a = signal.butter(8, 0.1, 'lowpass')
    filtedData = signal.filtfilt(b, a, data)
    return  filtedData
```

#### 4.数据重叠
- 每20ms采样一次，每2.56秒识别一次，一组数据共计128个点
- 采取50%数据重叠，即将前后64个点进行拼接


```python
def dataOverlap(data):
    data256 = []
    length = len(data)
    n = length//64
    for i in range(n-1):
        data256.append([])
        for j in range(64*i,64*(i+2)):
            data256[i].append(data[j])
    return data256
```

#### 5.特征值提取
- 每组数据提取6个特征值
- 最大值、最小值、中位数、均值、方差、绝对中位差


```python
def extractEigenvalues(data):
    # max min median mean var
    featureValue = []
    featureValue.append(max(data))
    featureValue.append(min(data))
    featureValue.append(np.median(data))
    featureValue.append(np.mean(data))
    featureValue.append(np.var(data))
    featureValue.append(stats.median_absolute_deviation(data))
    return  featureValue
```


```python
def dataProcessing(data):
    dataFeature = []
    filtedData = filtering(data)
    overlapData = dataOverlap(filtedData)
    for i in overlapData:
        dataFeature.append(extractEigenvalues(i))
    return dataFeature

def transpose(matrix):
    new_matrix = []
    for i in range(len(matrix[0])):
        matrix1 = []
        for j in range(len(matrix)):
            matrix1.append(matrix[j][i])
        new_matrix.append(matrix1)
    return new_matrix
```

#### 6.训练集生成


```python
def generateDataSet(data):
    Data = [[],[],[],[],[],[]]
    global target
    for i in range(len(data)):
        Data[0] = Data[0] + dataProcessing(data[i]['accx'])
        Data[1] = Data[1] + dataProcessing(data[i]['accy'])
        Data[2] = Data[2] + dataProcessing(data[i]['accz'])
        Data[3] = Data[3] + dataProcessing(data[i]['gryx'])
        Data[4] = Data[4] + dataProcessing(data[i]['gryy'])
        Data[5] = Data[5] + dataProcessing(data[i]['gryz'])
        for j in range(len(dataProcessing(data[i]['accx']))):
            target.append(data[i]['activity'])
    Data = transpose(Data)
    newData = []
    for i in range(len(Data)):
        newData.append([])
        for j in range(len(Data[i])):
            newData[i] = newData[i]+Data[i][j]

    return newData
```

### 二、模型训练
- 首先通过数据处理得到训练集Data
- 然后调用随机森林包训练模型，得到rfcModel.pkl并导出


```python
import dataProcessing
import joblib
from sklearn.ensemble.forest import RandomForestClassifier
from sklearn.model_selection import train_test_split
data = dataProcessing.readJson("activity1.json")+dataProcessing.readJson("activity2.json")+dataProcessing.readJson("activity3.json")+dataProcessing.readJson("activity4.json")

Data = dataProcessing.generateDataSet(data)

X_train, X_test, y_train, y_test = train_test_split(Data,dataProcessing.target, test_size=0.3)
rfc = RandomForestClassifier()
rfc = rfc.fit(X_train, y_train)
result = rfc.score(X_test, y_test)

print(result)
print(rfc.predict(X_test))
joblib.dump(rfc, "rfcModel.pkl")
```

### 三、模型应用
- 在linux服务器上部署模型
- 读取模型
- 数据处理
- 将数据导入模型得到预测值，并返回到小程序端


```python
from flask import Flask,request
app = Flask(__name__)
import joblib
import numpy as np
from scipy import signal, stats
@app.route('/',methods=['post','get'])

def index():
    fr = open('rfcModel.pkl', 'rb')
    inf = joblib.load(fr)
    fr.close()

    data =  request.get_json()
    processed_data = []
    b, a = signal.butter(8, 0.1, 'lowpass')
    processed_data += dataProcess(data['accXs'], b, a)
    processed_data += dataProcess(data['accYs'], b, a)
    processed_data += dataProcess(data['accZs'], b, a)
    processed_data += dataProcess(data['gyrXs'], b, a)
    processed_data += dataProcess(data['gyrYs'], b, a)
    processed_data += dataProcess(data['gyrZs'], b, a)

    predict = inf.predict([processed_data])

    return str(predict)
def dataProcess(data,b,a):
    data_ = signal.filtfilt(b, a, data)
    processed_data = [max(data_), min(data_), np.median(data_), np.mean(data_), np.var(data_),stats.median_absolute_deviation(data_)]
    return processed_data

if __name__ == '__main__':
    app.run(host='172.17.0.2', debug=True,port=80)
```



## 写在最后

​        感谢大家的阅读/~如果感兴趣可以到我的github下载全部项目和数据集.记得star~另外放上小程序的二维：
