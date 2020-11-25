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

