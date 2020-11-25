import json
import numpy as np
from scipy import signal
from scipy import stats
target = []
def readJson(file_name):
     with open(file_name,'r', encoding = 'utf-8') as file:
          data = []
          for line in file.readlines():
               dic = json.loads(line)
               data.append(dic)
     return data

def filtering(data):
    b, a = signal.butter(8, 0.1, 'lowpass')
    filtedData = signal.filtfilt(b, a, data)
    return  filtedData

def dataOverlap(data):
    data256 = []
    length = len(data)
    n = length//64
    for i in range(n-1):
        data256.append([])
        for j in range(64*i,64*(i+2)):
            data256[i].append(data[j])
    return data256

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




