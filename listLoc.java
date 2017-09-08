/* package whatever */

import java.util.*;
import java.lang.*;
import java.io.*;

public class loc
{
	//x,y current location and input is the list of all locations and r is radius
	public ArrayList<Location> locate(ArrayList input, double x, double y, double r)
	{
		ArrayList<location> out = new ArrayList<Location>();
		for(int i=0;i<input.size(); i++)
		{
			if((Math.sqrt(((input.get(i).x-x)*(input.get(i).x-x))+((input.get(i).y-y)*(input.get(i).y-y))))<=r)
				out.add(input.get(i));
		}
		return out;
	}
}