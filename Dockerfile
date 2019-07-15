FROM maven:3.6.1-jdk-11 as builder

WORKDIR /opt/service

COPY ./pom.xml .
RUN mvn -B -e -C -T 1C org.apache.maven.plugins:maven-dependency-plugin:3.0.2:go-offline

COPY . .

RUN mvn -B -e -o -T 1C package

FROM openjdk:11-jdk

RUN mkdir -p /opt/service

WORKDIR /opt/service

COPY --from=builder /opt/service/target/sch_api.0.0.1-SNAPSHOT.jar .
COPY --from=builder /opt/service/conf/application.conf ./conf/application.conf

CMD java ${JAVA_OPTS} \
    -server -Xms128m -Xmx128m \
    -Djava.security.egd=file:/dev/./urandom \
    -jar /opt/service/sch_api.0.0.1-SNAPSHOT.jar
