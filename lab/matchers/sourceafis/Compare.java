import com.machinezoo.sourceafis.*;
import java.nio.file.*;
import java.util.*;
/** Reads one TSV manifest and emits only pair scores, never templates. */
public class Compare {
 public static void main(String[] args) throws Exception {
  Map<String,FingerprintTemplate> cache=new HashMap<>();
  for(String line:Files.readAllLines(Path.of(args[0]))){
   String[] f=line.split("\t");if(f.length!=3)continue;
   for(int i=1;i<3;i++){String path=f[i];if(!cache.containsKey(path))cache.put(path,new FingerprintTemplate(new FingerprintImage(Files.readAllBytes(Path.of(path)),new FingerprintImageOptions().dpi(500))));}
   double score=new FingerprintMatcher(cache.get(f[1])).match(cache.get(f[2]));System.out.println(f[0]+"\t"+score);
  }
 }
}
